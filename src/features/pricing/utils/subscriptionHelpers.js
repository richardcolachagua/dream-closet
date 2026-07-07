export const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due"]);

export const hasActiveSubscription = (subscription) => {
  const status = String(subscription?.status || "").toLowerCase();
  return ACTIVE_STATUSES.has(status);
};

export const formatSubscriptionStatus = (status) => {
  const normalized = String(status || "inactive")
    .replace(/_/g, " ")
    .trim();

  if (!normalized) return "Inactive";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const getSubscriptionCallout = (subscription) => {
  if (!subscription) {
    return "You’re currently on the free plan. Upgrade when billing is ready to unlock premium features.";
  }

  const status = String(subscription.status || "").toLowerCase();
  const cancelAtPeriodEnd = Boolean(subscription.cancelAtPeriodEnd);

  if (status === "active" && cancelAtPeriodEnd) {
    return "Your subscription is active and scheduled to cancel at the end of the current billing period.";
  }

  if (status === "active") {
    return "Your subscription is active. You can manage billing, payment methods, and cancellation in the customer portal.";
  }

  if (status === "trialing") {
    return "You’re currently on a trial plan. You can manage billing details in the customer portal.";
  }

  if (status === "past_due") {
    return "Your subscription is past due. Update your payment method to keep premium access.";
  }

  if (status === "canceled") {
    return "Your subscription has been canceled. You can re-subscribe any time.";
  }

  return "You’re currently on the free plan. Upgrade when billing is ready to unlock premium features.";
};
