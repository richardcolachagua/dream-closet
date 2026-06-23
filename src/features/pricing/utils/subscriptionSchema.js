export const EMPTY_SUBSCRIPTION = {
  status: "inactive",
  plan: "free",
  customerId: null,
  subscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
};

export const normalizeSubscription = (subscription) => ({
  ...EMPTY_SUBSCRIPTION,
  ...(subscription || {}),
});

export const hasActiveSubscription = (subscription) => {
  const normalized = normalizeSubscription(subscription);
  return normalized.status === "active" || normalized.status === "trialing";
};
