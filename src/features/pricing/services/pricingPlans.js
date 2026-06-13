export const PLAN_IDS = {
  FREE: "free",
  PRO: "pro",
};

export const PRICING_PLANS = [
  {
    id: PLAN_IDS.FREE,
    name: "Dream Closet Free",
    priceLabel: "$0",
    description: "A lightweight way to try the product and explore your style.",
    ctaLabel: "Continue with Free",
    highlighted: false,
    badge: "Starter",
    features: [
      "5 searches per day",
      "Basic search results and filtering",
      "Save searches and favorite pieces",
      "Onboarding-based personalization",
    ],
    footnote:
      "Best for first-time users exploring the Dream Closet experience.",
  },
  {
    id: PLAN_IDS.PRO,
    name: "Dream Closet Pro",
    priceLabel: "$9.99 / month",
    description:
      "Premium search and personalization for shoppers who use Dream Closet regularly.",
    ctaLabel: "Upgrade to Pro",
    highlighted: true,
    badge: "Best value",
    features: [
      "Unlimited searches",
      "Premium AI-powered style matching",
      "Saved closet collections",
      "Priority access to improved recommendations",
      "Subscription management through Stripe",
    ],
    footnote: "Monthly subscription. Cancel anytime from the billing portal.",
  },
];

export const getCurrentPlanId = (subscription) =>
  subscription?.status === "active" ? PLAN_IDS.PRO : PLAN_IDS.FREE;
