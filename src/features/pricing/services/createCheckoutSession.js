const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Login required");
    }

    const uid = context.auth.uid;
    const returnUrl =
      typeof data?.returnUrl === "string"
        ? data.returnUrl
        : process.env.APP_URL;
    const cancelUrl =
      typeof data?.cancelUrl === "string"
        ? data.cancelUrl
        : `${process.env.APP_URL}/pricing`;

    const userRef = admin.firestore().doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data() || {};

    let customerId =
      userData?.subscription?.stripeCustomerId || userData?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUID: uid },
      });

      customerId = customer.id;

      await userRef.set(
        {
          stripeCustomerId: customerId,
          subscription: {
            ...(userData.subscription || {}),
            stripeCustomerId: customerId,
          },
        },
        { merge: true },
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: returnUrl,
      cancel_url: cancelUrl,
      metadata: { firebaseUID: uid },
      subscription_data: {
        metadata: { firebaseUID: uid },
      },
      allow_promotion_codes: true,
    });

    return { url: session.url, sessionId: session.id };
  },
);
