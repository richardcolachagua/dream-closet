const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createStripeClient = require('stripe');

const db = admin.firestore();

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }

  return createStripeClient(secretKey);
};

const getSubscriptionIdFromInvoice = (invoice) => {
  if (typeof invoice?.subscription === 'string') {
    return invoice.subscription;
  }

  if (invoice?.subscription?.id) {
    return invoice.subscription.id;
  }

  const parentSubscription =
    invoice?.parent?.subscription_details?.subscription;

  if (typeof parentSubscription === 'string') {
    return parentSubscription;
  }

  if (parentSubscription?.id) {
    return parentSubscription.id;
  }

  return null;
};

const getSubscriptionPrice = (subscription) =>
  subscription?.items?.data?.[0]?.price || null;

const findUidByCustomerId = async (customerId) => {
  if (!customerId) {
    return null;
  }

  const subscriptionCustomerQuery = await db
      .collection('users')
      .where('subscription.stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

  if (!subscriptionCustomerQuery.empty) {
    return subscriptionCustomerQuery.docs[0].id;
  }

  const legacyCustomerQuery = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .limit(1)
      .get();

  if (!legacyCustomerQuery.empty) {
    return legacyCustomerQuery.docs[0].id;
  }

  return null;
};

const resolveFirebaseUid = async (stripe, subscription) => {
  const metadataUid = subscription?.metadata?.firebaseUID;

  if (metadataUid) {
    return metadataUid;
  }

  const customerId =
    typeof subscription?.customer === 'string' ?
      subscription.customer :
      subscription?.customer?.id;

  const firestoreUid = await findUidByCustomerId(customerId);

  if (firestoreUid) {
    return firestoreUid;
  }

  if (!customerId) {
    return null;
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer?.deleted && customer?.metadata?.firebaseUID) {
      return customer.metadata.firebaseUID;
    }
  } catch (error) {
    console.error('Could not retrieve Stripe customer while resolving UID:', {
      customerId,
      code: error?.code,
      type: error?.type,
      message: error?.message,
    });
  }

  return null;
};

const upsertSubscription = async (stripe, subscription, explicitUid = null) => {
  const uid = explicitUid || (await resolveFirebaseUid(stripe, subscription));

  if (!uid) {
    console.warn('Ignoring Stripe subscription event with no Firebase UID.', {
      subscriptionId: subscription?.id,
      customerId: subscription?.customer,
      eventStatus: subscription?.status,
    });

    return;
  }

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();

  // Do not recreate a deleted Firestore user document if a delayed Stripe
  // event arrives after account deletion.
  if (!userSnap.exists) {
    console.warn('Ignoring Stripe event for a deleted or missing user.', {
      uid,
      subscriptionId: subscription?.id,
    });

    return;
  }

  const price = getSubscriptionPrice(subscription);

  await userRef.set(
      {
        subscription: {
          status: subscription?.status || 'unknown',
          planId: price?.product || null,
          priceId: price?.id || null,
          currentPeriodEnd: subscription?.current_period_end || null,
          cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
          stripeCustomerId:
          typeof subscription?.customer === 'string' ?
            subscription.customer :
            subscription?.customer?.id || null,
          stripeSubscriptionId: subscription?.id || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      {merge: true},
  );
};

const handleCheckoutCompleted = async (stripe, session) => {
  const uid = session?.metadata?.firebaseUID;

  if (!uid) {
    console.warn('Checkout session completed without firebaseUID metadata.', {
      sessionId: session?.id,
      customerId: session?.customer,
    });

    return;
  }

  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    console.warn(
        'Ignoring checkout completion for a deleted or missing user.',
        {
          uid,
          sessionId: session?.id,
        },
    );

    return;
  }

  const customerId =
    typeof session?.customer === 'string' ?
      session.customer :
      session?.customer?.id || null;

  await userRef.set(
      {
        stripeCustomerId: customerId,
        subscription: {
          stripeCustomerId: customerId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      {merge: true},
  );

  const subscriptionId =
    typeof session?.subscription === 'string' ?
      session.subscription :
      session?.subscription?.id;

  if (!subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  await upsertSubscription(stripe, subscription, uid);
};

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  let stripe;

  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error('Stripe webhook is not configured:', error.message);

    return res.status(503).json({
      error: 'Stripe webhook is not configured.',
    });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).send('Missing Stripe signature.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', {
      message: error?.message,
    });

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(stripe, event.data.object);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await upsertSubscription(stripe, event.data.object);
        break;
      }

      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = getSubscriptionIdFromInvoice(invoice);

        if (!subscriptionId) {
          console.warn('Invoice event received without a subscription ID.', {
            invoiceId: invoice?.id,
            eventType: event.type,
          });

          break;
        }

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(stripe, subscription);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return res.status(200).json({received: true});
  } catch (error) {
    console.error('Stripe webhook handling failed:', {
      eventId: event?.id,
      eventType: event?.type,
      code: error?.code,
      type: error?.type,
      message: error?.message,
    });

    return res.status(500).json({
      error: error?.message || 'Webhook handling failed.',
    });
  }
});
