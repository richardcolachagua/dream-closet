import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "./useOnboardingStatus";
import { useAuth } from "./AuthContext";
import { LoadingCircle } from "../frontend/Components/LoadingCircle";

const ONBOARDING_PREFIX = "/onboarding";

export const OnboardingGuard = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { onboarding, loading } = useOnboardingStatus();
  const location = useLocation();

  if (authLoading || loading) {
    return <LoadingCircle />;
  }

  // Not logged in: let your existing ProtectedRoute handle redirect to login
  if (!user) return <>{children}</>;

  const completed = Boolean(onboarding?.completed);
  const path = location.pathname;

  // If not completed and not already on onboarding, push into the correct step
  if (!completed && !path.startsWith(ONBOARDING_PREFIX)) {
    if (!onboarding?.gender) {
      return <Navigate to="/onboarding/gender" replace />;
    }
    if (!onboarding?.categories || onboarding.categories.length === 0) {
      return <Navigate to="/onboarding/categories" replace />;
    }
    return <Navigate to="/onboarding.brands" replace />;
  }

  // If completed and user tries to visit onboarding manually, bounce them out
  if (completed && path.startsWith(ONBOARDING_PREFIX)) {
    return <Navigate to="/searchpage" replace />;
  }

  return <>{children}</>;
};
