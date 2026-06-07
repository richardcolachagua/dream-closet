import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "./useOnboardingStatus";
import { useAuth } from "./AuthContext";
import { Box, CircularProgress } from "@mui/material";

const ONBOARDING_PREFIX = "/onboarding";

const LoadingCircle = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "black",
    }}
  >
    <CircularProgress />
  </Box>
);

const getNextOnboardingPath = (onboarding) => {
  if (!onboarding?.gender) {
    return "/onboarding/gender";
  }

  if (!onboarding?.categories || onboarding.categories.length === 0) {
    return "/onboarding/categories";
  }

  if (!onboarding?.brands || onboarding.brands.length === 0) {
    return "/onboarding/brands";
  }

  return "/onboarding/brands";
};

export const OnboardingGuard = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { onboarding, loading } = useOnboardingStatus();
  const location = useLocation();

  if (authLoading || loading) {
    return <LoadingCircle />;
  }

  if (!user) {
    return <>{children}</>;
  }

  const completed = Boolean(onboarding?.completed);
  const path = location.pathname;
  const isOnboardingRoute = path.startsWith(ONBOARDING_PREFIX);
  const fullPath = `${location.pathname}${location.search}${location.hash}`;

  if (!completed && !isOnboardingRoute) {
    return (
      <Navigate
        to={getNextOnboardingPath(onboarding)}
        replace
        state={{ from: fullPath }}
      />
    );
  }

  if (completed && isOnboardingRoute) {
    return <Navigate to="/searchpage" replace />;
  }

  return <>{children}</>;
};
