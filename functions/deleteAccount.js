const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.deleteAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const uid = context.auth.uid;
  const db = admin.firestore();
  const userRef = db.doc(`users/${uid}`);
  const userSnap = await userRef.get();
  const userData = userSnap.data() || {};

  const stripeCustomerId =
    userData?.subscription?.stripeCustomerId || userData?.stripeCustomerId;
  const stripeSubscriptionId =
    userData?.subscription?.stripeSubscriptionId || null;

  try {
    if (stripeSubscriptionId) {
      await stripe.subscriptions.cancel(stripeSubscriptionId);
    }

    const savedItemsSnap = await userRef.collection("savedItems").get();
    const savedSearchesSnap = await userRef.collection("savedSearches").get();

    const batch = db.batch();

    savedItemsSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    savedSearchesSnap.forEach((docSnap) => {
      batch.delete(docSnap.ref);
    });

    batch.delete(userRef);

    await batch.commit();

    if (stripeCustomerId) {
      try {
        await stripe.customers.del(stripeCustomerId);
      } catch (stripeCustomerError) {
        console.error("Stripe customer deletion failed:", stripeCustomerError);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("deleteAccount error:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to delete account.",
    );
  }
});
