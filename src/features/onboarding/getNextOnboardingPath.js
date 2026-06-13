import { ROUTES } from "../../app/routes/routePaths";

export const getNextOnboardingPath = (onboarding) => {
  if (!onboarding?.gender) {
    return ROUTES.ONBOARDING_GENDER;
  }

  if (
    !Array.isArray(onboarding?.categories) ||
    onboarding.categories.length === 0
  ) {
    return ROUTES.ONBOARDING_CATEGORIES;
  }

  if (!Array.isArray(onboarding?.brands) || onboarding.brands.length === 0) {
    return ROUTES.ONBOARDING_BRANDS;
  }

  return ROUTES.ONBOARDING_BRANDS;
};

export const isOnboardingComplete = (onboarding) =>
  Boolean(onboarding?.completed);
