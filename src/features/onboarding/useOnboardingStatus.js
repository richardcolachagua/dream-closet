import { useAuth } from "../auth/AuthContext";

const EMPTY_ONBOARDING = {
  completed: false,
  gender: null,
  categories: [],
  brands: [],
};

const normalizeOnboarding = (raw) => {
  if (!raw || typeof raw !== "object") {
    return EMPTY_ONBOARDING;
  }

  return {
    completed: raw.completed === true,
    gender: raw.gender ?? null,
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    brands: Array.isArray(raw.brands) ? raw.brands : [],
  };
};

export const useOnboardingStatus = () => {
  const {
    loading: authLoading,
    isRegistered,
    profile,
    profileLoading,
    profileError,
  } = useAuth();

  return {
    onboarding: isRegistered
      ? normalizeOnboarding(profile?.onboarding)
      : EMPTY_ONBOARDING,
    loading: authLoading || (isRegistered && profileLoading),
    error: isRegistered ? profileError : null,
    hasProfile: isRegistered && Boolean(profile),
  };
};
