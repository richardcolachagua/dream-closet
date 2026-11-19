const functions = require('firebase-functions');
const {db} = require('../../config/firebase');
const createStripeClient = require('stripe');

const APP_URL = process.env.APP_URL;

const ALLOWED_RETURN_PATHS = new Set([
  '/profilepage',
  '/searchpage',
  '/settings',
  '/pricing',
]);

const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new functions.https.HttpsError(
        'failed-precondition',
        'Billing is not configured for this environment.',
    );
  }

  return createStripeClient(secretKey);
};

const getSafePath = (requestedPath, fallbackPath) =>
  typeof requestedPath === 'string' && ALLOWED_RETURN_PATHS.has(requestedPath) ?
    requestedPath :
    fallbackPath;

exports.createCheckoutSession = functions.https.onCall(
    async (data, context) => {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Login required.',
        );
      }

      if (!APP_URL || !process.env.STRIPE_PRICE_ID) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Billing is not configured for this environment.',
        );
      }

      const stripe = getStripeClient();
      const uid = context.auth.uid;

      const returnPath = getSafePath(data?.returnPath, '/settings');
      const cancelPath = getSafePath(data?.cancelPath, '/pricing');

      const userRef = db.doc(`users/${uid}`);
      const deletionRef = db.doc(`accountDeletions/${uid}`);
      const deletionSnapshot = await deletionRef.get();
      if (deletionSnapshot.exists) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Account deletion is in progress.',
        );
      }

      const userSnap = await userRef.get();
      if (!userSnap.exists) {
        throw new functions.https.HttpsError(
            'not-found',
            'User profile not found.',
        );
      }
      const userData = userSnap.data();

      let customerId =
      userData?.subscription?.stripeCustomerId || userData?.stripeCustomerId;
      let createdCustomerId = null;

      try {
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: context.auth.token.email || undefined,
            metadata: {
              firebaseUID: uid,
            },
          });

          customerId = customer.id;
          createdCustomerId = customer.id;

          await db.runTransaction(async (transaction) => {
            const [currentDeletion, currentUser] = await Promise.all([
              transaction.get(deletionRef),
              transaction.get(userRef),
            ]);
            if (currentDeletion.exists || !currentUser.exists) {
              throw new functions.https.HttpsError(
                  'failed-precondition',
                  'Account deletion has started. Checkout was not created.',
              );
            }

            transaction.set(
                userRef,
                {
                  stripeCustomerId: customerId,
                  subscription: {
                    ...(currentUser.data()?.subscription || {}),
                    stripeCustomerId: customerId,
                  },
                },
                {merge: true},
            );
          });
        }

        const deletionBeforeCheckout = await deletionRef.get();
        if (deletionBeforeCheckout.exists) {
          await stripe.customers.del(customerId);
          throw new functions.https.HttpsError(
              'failed-precondition',
              'Account deletion has started. Checkout was not created.',
          );
        }

        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: `${APP_URL}${returnPath}`,
          cancel_url: `${APP_URL}${cancelPath}`,
          metadata: {
            firebaseUID: uid,
          },
          subscription_data: {
            metadata: {
              firebaseUID: uid,
            },
          },
          allow_promotion_codes: true,
        });

        const deletionAfterCheckout = await deletionRef.get();
        if (deletionAfterCheckout.exists) {
          if (session.status === 'open') {
            await stripe.checkout.sessions.expire(session.id);
          }
          const subscriptionId =
            typeof session.subscription === 'string' ?
              session.subscription :
              session.subscription?.id;
          if (subscriptionId) {
            await stripe.subscriptions.cancel(subscriptionId);
          }
          throw new functions.https.HttpsError(
              'failed-precondition',
              'Account deletion has started. Checkout was canceled.',
          );
        }

        return {
          url: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        if (
          createdCustomerId &&
          error instanceof functions.https.HttpsError &&
          error.code === 'failed-precondition'
        ) {
          try {
            await stripe.customers.del(createdCustomerId);
          } catch (cleanupError) {
            console.error('Could not remove checkout customer during deletion:', {
              uid,
              customerId: createdCustomerId,
              code: cleanupError?.code,
              message: cleanupError?.message,
            });
          }
        }

        console.error('Failed to create Stripe Checkout session:', {
          uid,
          customerId,
          code: error?.code,
          type: error?.type,
          message: error?.message,
        });

        if (error instanceof functions.https.HttpsError) throw error;
        throw new functions.https.HttpsError(
            'internal',
            'Could not start checkout. Please try again later.',
        );
      }
    },
);
