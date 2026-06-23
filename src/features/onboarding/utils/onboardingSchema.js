export const EMPTY_ONBOARDING = {
  gender: null,
  categories: [],
  brands: [],
  completed: false,
};

export const buildOnboardingState = (overrides = {}) => ({
  ...EMPTY_ONBOARDING,
  ...overrides,
  categories: Array.isArray(overrides.categories) ? overrides.categories : [],
  brands: Array.isArray(overrides.brands) ? overrides.brands : [],
  completed: Boolean(overrides.completed),
  gender: overrides.gender ?? null,
});
