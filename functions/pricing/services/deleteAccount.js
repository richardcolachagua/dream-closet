const functions = require('firebase-functions');
const admin = require('firebase-admin');
const createStripeClient = require('stripe');

const BILLING_ACTIVE_STATUSES = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
]);

const MAX_AUTH_AGE_SECONDS = 10 * 60;

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

const verifyRecentAuthentication = (context) => {
  const authTime = Number(context.auth?.token?.auth_time || 0);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!authTime || nowSeconds - authTime > MAX_AUTH_AGE_SECONDS) {
    throw new functions.https.HttpsError(
        'failed-precondition',
        'Please sign in again before deleting your account.',
    );
  }
};

exports.deleteAccount = functions.https.onCall(async (_, context) => {
  if (!context.auth?.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Login required.');
  }

  verifyRecentAuthentication(context);

  const uid = context.auth.uid;
  const db = admin.firestore();
  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const userData = userSnap.exists ? userSnap.data() : {};

  const subscription = userData?.subscription || {};
  const subscriptionId = subscription.stripeSubscriptionId;
  const shouldCancelSubscription =
    subscriptionId && BILLING_ACTIVE_STATUSES.has(subscription.status);

  if (shouldCancelSubscription) {
    const stripe = getStripeClient();

    try {
      await stripe.subscriptions.cancel(subscriptionId);
    } catch (error) {
      console.error('Stripe subscription cancellation failed:', {
        uid,
        subscriptionId,
        code: error?.code,
        type: error?.type,
        message: error?.message,
      });

      throw new functions.https.HttpsError(
          'failed-precondition',
          'We could not cancel your subscription. Your account was not deleted.',
      );
    }
  }

  try {
    if (userSnap.exists) {
      await db.recursiveDelete(userRef);
    }

    await admin.auth().deleteUser(uid);

    return {success: true};
  } catch (error) {
    console.error('Account deletion failed:', {
      uid,
      code: error?.code,
      message: error?.message,
    });

    throw new functions.https.HttpsError(
        'internal',
        'We could not delete your account. Please contact support.',
    );
  }
});
