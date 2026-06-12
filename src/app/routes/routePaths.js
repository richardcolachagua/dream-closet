export const ROUTES = {
  HOME: "/homepage",
  LOGIN: "/loginpage",
  SIGN_UP: "/signuppage",
  SEARCH: "/searchpage",
  PROFILE: "/profilepage",
  SAVED: "/SavedItemsAndSearches",
  PRICING: "/pricing",

  ONBOARDING_ROOT: "/onboarding",
  ONBOARDING_GENDER: "/onboarding/gender",
  ONBOARDING_CATEGORIES: "/onboarding/categories",
  ONBOARDING_BRANDS: "/onboarding/brands",
};

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.SEARCH;
export const DEFAULT_PUBLIC_ROUTE = ROUTES.HOME;

export const buildCurrentPath = (location) =>
  `${location.pathname}${location.search}${location.hash}`;

export const isOnboardingRoute = (pathname) =>
  pathname.startsWith(ROUTES.ONBOARDING_ROOT);
