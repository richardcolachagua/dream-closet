import React from "react";
import { Alert, Box, CircularProgress } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  buildCurrentPath,
  ROUTES,
} from "../../app/routes/routePaths";

const LoadingRoute = () => (
  <Box
    sx={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "black",
    }}
  >
    <CircularProgress />
  </Box>
);

export const ProtectedRoute = ({
  children,
  inverse = false,
  redirectPath,
  roles = [],
}) => {
  const location = useLocation();

  const {
    loading,
    isRegistered,
    role,
    claimsLoading,
    claimsError,
    hasProfile,
    profileLoading,
    profileError,
  } = useAuth();

  const currentPath = buildCurrentPath(location);

  if (loading || (isRegistered && profileLoading)) {
    return <LoadingRoute />;
  }

  if (inverse) {
    if (isRegistered && hasProfile) {
      return (
        <Navigate to={redirectPath || DEFAULT_AUTHENTICATED_ROUTE} replace />
      );
    }

    return <>{children}</>;
  }

  if (!isRegistered) {
    return (
      <Navigate
        to={redirectPath || ROUTES.LOGIN}
        replace
        state={{ from: currentPath }}
      />
    );
  }

  if (profileError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Your profile could not be loaded. Please reload the page. If the
          problem continues, sign out and sign in again.
        </Alert>
      </Box>
    );
  }

  if (!hasProfile) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: currentPath }} />;
  }

  if (roles.length > 0) {
    if (claimsLoading) {
      return <LoadingRoute />;
    }

    if (claimsError || !role || !roles.includes(role)) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            You do not have permission to access this page.
          </Alert>
        </Box>
      );
    }
  }

  return <>{children}</>;
};
