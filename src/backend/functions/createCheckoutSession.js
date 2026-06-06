const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    if (!context.auth)
      throw new functions.https.HttpsError("unauthenticated", "Login required");

    const uid = context.auth.uid;
    const userRef = admin.firestore().doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    // Create or reuse a Stripe customer
    let customerId = userData?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.auth.token.email,
        metadata: { firebaseUID: uid },
      });
      customerId = customer.id;
      await userRef.update({ stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.APP_URL}/profilepage?subscription=success`,
      cancel_url: `${process.env.APP_URL}/pricing`,
      metadata: { firebaseUID: uid },
    });

    return { sessionId: session.id, url: session.url };
  },
);
