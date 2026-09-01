const functions = require('firebase-functions');
const {db} = require('../../config/firebase');
const createStripeClient = require('stripe');

const APP_URL = process.env.APP_URL;

const ALLOWED_RETURN_PATHS = new Set([
  '/profilepage',
  '/searchpage',
  '/settings',
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

exports.createCustomerPortalSession = functions.https.onCall(
    async (data, context) => {
      if (!context.auth?.uid) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Login required.',
        );
      }

      if (!APP_URL) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'Application URL is not configured.',
        );
      }

      const requestedPath =
      typeof data?.returnPath === 'string' ? data.returnPath : '/settings';

      const safeReturnPath = ALLOWED_RETURN_PATHS.has(requestedPath) ?
      requestedPath :
      '/settings';

      const userRef = db.doc(`users/${context.auth.uid}`);
      const userSnap = await userRef.get();

      if (!userSnap.exists) {
        throw new functions.https.HttpsError(
            'not-found',
            'User profile not found.',
        );
      }

      const userData = userSnap.data();

      const customerId =
      userData?.subscription?.stripeCustomerId || userData?.stripeCustomerId;

      if (!customerId) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'No billing profile exists for this account.',
        );
      }

      const stripe = getStripeClient();

      try {
        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${APP_URL}${safeReturnPath}`,
        });

        return {url: session.url};
      } catch (error) {
        console.error('Failed to create customer portal session:', {
          uid: context.auth.uid,
          customerId,
          code: error?.code,
          type: error?.type,
          message: error?.message,
        });

        throw new functions.https.HttpsError(
            'internal',
            'Could not open billing settings. Please try again later.',
        );
      }
    },
);
