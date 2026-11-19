const cancelSubscriptionForDeletedAccount = async (stripe, uid, subscriptionId) => {
  if (!subscriptionId) return;

  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    if (error?.code === 'resource_missing') return;
    throw error;
  }
  if (
    subscription?.status === 'canceled' ||
    subscription?.status === 'incomplete_expired'
  ) {
    return;
  }

  const canceled = await stripe.subscriptions.cancel(
      subscriptionId,
      {},
      {idempotencyKey: `account-deletion-${uid}-${subscriptionId}`},
  );
  if (canceled?.status !== 'canceled') {
    throw new Error(
        `Stripe did not confirm cancellation for ${subscriptionId}.`,
    );
  }
};

module.exports = {cancelSubscriptionForDeletedAccount};
