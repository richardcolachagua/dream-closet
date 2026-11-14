import { Alert, Box } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "./useOnboardingStatus";
import { useAuth } from "../auth/AuthContext";
import AppLoadingScreen from "../home/components/AppLoadingScreen";
import {
  ROUTES,
  buildCurrentPath,
  isOnboardingRoute,
} from "../../app/routes/routePaths";
import {
  getNextOnboardingPath,
  isOnboardingComplete,
} from "./getNextOnboardingPath";

export const OnboardingGuard = ({ children }) => {
  const location = useLocation();

  const { loading: authLoading, isRegistered } = useAuth();

  const {
    onboarding,
    loading: onboardingLoading,
    error,
    hasProfile,
  } = useOnboardingStatus();

  if (authLoading) {
    return <AppLoadingScreen />;
  }

  if (!isRegistered) {
    return <>{children}</>;
  }

  if (onboardingLoading) {
    return <AppLoadingScreen />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          We couldn’t load your onboarding status. Please reload the page. If
          the problem continues, sign out and sign in again.
        </Alert>
      </Box>
    );
  }

  const currentPath = buildCurrentPath(location);

  if (!hasProfile) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: currentPath }} />;
  }

  const completed = isOnboardingComplete(onboarding);
  const currentlyInOnboarding = isOnboardingRoute(location.pathname);

  if (completed && currentlyInOnboarding) {
    return <Navigate to={ROUTES.SEARCH} replace />;
  }

  if (!completed && !currentlyInOnboarding) {
    return (
      <Navigate
        to={getNextOnboardingPath(onboarding)}
        replace
        state={{ from: currentPath }}
      />
    );
  }

  return <>{children}</>;
};
