exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const uid = session.metadata?.firebaseUID;
      if (uid) {
        await admin
          .firestore()
          .doc(`users/${uid}`)
          .update({
            subscription: {
              status: session.status, // "active", "canceled", etc.
              planId: session.items.data[0].price.id,
              currentPeriodEnd: session.current_period_end,
              stripeSubscriptionId: session.id,
            },
          });
      }
      break;
    }
    case "customer.subscription.deleted": {
      const uid = session.metadata?.firebaseUID;
      if (uid) {
        await admin
          .firestore()
          .doc(`users/${uid}`)
          .update({
            subscription: { status: "canceled" },
          });
      }
      break;
    }
  }

  res.json({ received: true });
});
