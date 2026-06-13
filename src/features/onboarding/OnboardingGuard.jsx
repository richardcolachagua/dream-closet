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

export const OnboardingGuard = ({ children }) => {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { onboarding, loading: onboardingLoading } = useOnboardingStatus();

  if (authLoading || onboardingLoading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return <>{children}</>;
  }

  const completed = isOnboardingComplete(onboarding);
  const currentPath = buildCurrentPath(location);
  const currentlyInOnboarding = isOnboardingRoute(location.pathname);

  if (!completed && !currentlyInOnboarding) {
    return (
      <Navigate
        to={getNextOnboardingPath(onboarding)}
        replace
        state={{ from: currentPath }}
      />
    );
  }

  if (completed && currentlyInOnboarding) {
    return <Navigate to={ROUTES.SEARCH} replace />;
  }

  return <>{children}</>;
};
