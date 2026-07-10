import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "../../features/onboarding/useOnboardingStatus";
import { useAuth } from "../auth/AuthContext";
import AppLoadingScreen from "../../features/home/components/AppLoadingScreen";
import {
  ROUTES,
  buildCurrentPath,
  isOnboardingRoute,
} from "../../app/routes/routePaths";
import {
  getNextOnboardingPath,
  isOnboardingComplete,
} from "../../features/onboarding/getNextOnboardingPath";

/**
 * Route guard that ensures:
 * - Authenticated users must complete onboarding before accessing core app routes.
 * - Completed users are pushed out of onboarding routes into search.
 * - Unauthenticated visitors bypass onboarding guard entirely.
 */
export const OnboardingGuard = ({ children }) => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { onboarding, loading: onboardingLoading } = useOnboardingStatus();

  // Still resolving auth or onboarding — keep user in a branded loading state
  if (authLoading || onboardingLoading) {
    return <AppLoadingScreen />;
  }

  // No authenticated user → let public routes render freely
  if (!user) {
    return <>{children}</>;
  }

  const completed = isOnboardingComplete(onboarding);
  const currentPath = buildCurrentPath(location);
  const currentlyInOnboarding = isOnboardingRoute(location.pathname);

  // Authenticated, not completed, and outside onboarding routes → redirect into next onboarding step
  if (!completed && !currentlyInOnboarding) {
    return (
      <Navigate
        to={getNextOnboardingPath(onboarding)}
        replace
        state={{ from: currentPath }}
      />
    );
  }

  // Authenticated, marked completed, but currently on onboarding route → send to main search surface
  if (completed && currentlyInOnboarding) {
    return <Navigate to={ROUTES.SEARCH} replace />;
  }

  // Authenticated and either fully onboarded or viewing non-onboarding routes
  return <>{children}</>;
};
