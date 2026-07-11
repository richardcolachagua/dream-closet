export const ROUTES = {
  ROOT: "/",
  HOME: "/homepage",
  CONTACT: "/contactpage",
  LOGIN: "/loginpage",
  SIGNUP: "/signuppage",
  LOGOUT: "/logoutpage",
  FORGOT_PASSWORD: "/forgotpassword",
  CHECK_EMAIL: "/checkyouremail",
  PASSWORD_RESET: "/passwordreset",
  SET_PASSWORD: "/setanewpassword",
  PASSWORD_SUCCESS: "/successfulpage",

  SEARCH: "/searchpage",
  FREE_SEARCH: "/freesearchpage",
  PREMIUM_SEARCH: "/premium-search",
  PROFILE: "/profilepage",
  SAVED: "/saved-items-and-searches",
  PRICING: "/pricing",
  SETTINGS: "/settingspage",
  PRIVACY_POLICY: "/privacypolicypage",
  TERMS: "/tospage",
  NOT_FOUND: "/notfound",

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
