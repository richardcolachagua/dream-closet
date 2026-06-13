const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCustomerPortalSession = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const uid = context.auth.uid;
    const returnUrl =
      typeof data?.returnUrl === "string"
        ? data.returnUrl
        : `${process.env.APP_URL}/profilepage`;
    const userSnap = await admin.firestore().doc(`users/${uid}`).get();
    const customerId =
      userSnap.data()?.subscription?.stripeCustomerId ||
      userSnap.data()?.stripeCustomerId;

    if (!customerId) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "No Stripe customer found for this user.",
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  },
);
