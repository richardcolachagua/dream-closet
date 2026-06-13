const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const upsertSubscription = async (subscription) => {
  const uid = subscription.metadata?.firebaseUID;
  if (!uid) return;

  await admin
    .firestore()
    .doc(`users/${uid}`)
    .set(
      {
        subscription: {
          status: subscription.status,
          planId: subscription.items?.data?.[0]?.price?.product || null,
          priceId: subscription.items?.data?.[0]?.price?.id || null,
          currentPeriodEnd: subscription.current_period_end || null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          stripeCustomerId: subscription.customer || null,
          stripeSubscriptionId: subscription.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );
};

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await upsertSubscription(event.data.object);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const uid = subscription.metadata?.firebaseUID;

        if (uid) {
          await admin
            .firestore()
            .doc(`users/${uid}`)
            .set(
              {
                subscription: {
                  status: "canceled",
                  stripeCustomerId: subscription.customer || null,
                  stripeSubscriptionId: subscription.id,
                  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                },
              },
              { merge: true },
            );
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const stripeSubscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        await upsertSubscription(stripeSubscription);
        break;
      }
      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Webhook handling failed." });
  }
});
