import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "../useOnboardingStatus";
import { useAuth } from "../AuthContext";
import AppLoadingScreen from "../Components/feedback/AppLoadingScreen";
import {
  ROUTES,
  buildCurrentPath,
  isOnboardingRoute,
} from "../routes/routePaths";
import {
  getNextOnboardingPath,
  isOnboardingComplete,
} from "./routes/getNextOnboardingPath";

export const OnboardingGuard = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { onboarding, loading: onboardingLoading } = useOnboardingStatus();
  const location = useLocation();

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
