const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const APP_URL = process.env.APP_URL;

const ALLOWED_RETURN_PATHS = new Set([
  "/profilepage",
  "/searchpage",
  "/settings",
  "/pricing",
]);

const getSafePath = (requestedPath, fallbackPath) =>
  typeof requestedPath === "string" && ALLOWED_RETURN_PATHS.has(requestedPath)
    ? requestedPath
    : fallbackPath;

exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    if (!context.auth?.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Login required.",
      );
    }

    if (
      !APP_URL ||
      !process.env.STRIPE_SECRET_KEY ||
      !process.env.STRIPE_PRICE_ID
    ) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Billing is not configured for this environment.",
      );
    }

    const uid = context.auth.uid;
    const returnPath = getSafePath(data?.returnPath, "/settings");
    const cancelPath = getSafePath(data?.cancelPath, "/pricing");

    const userRef = admin.firestore().doc(`users/${uid}`);
    const userSnap = await userRef.get();
    const userData = userSnap.exists ? userSnap.data() : {};

    let customerId =
      userData?.subscription?.stripeCustomerId || userData?.stripeCustomerId;

    try {
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: context.auth.token.email || undefined,
          metadata: {
            firebaseUID: uid,
          },
        });

        customerId = customer.id;

        await userRef.set(
          {
            stripeCustomerId: customerId,
            subscription: {
              ...(userData?.subscription || {}),
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

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Failed to create Stripe Checkout session:", {
        uid,
        customerId,
        code: error?.code,
        type: error?.type,
        message: error?.message,
      });

      throw new functions.https.HttpsError(
        "internal",
        "Could not start checkout. Please try again later.",
      );
    }
  },
);
