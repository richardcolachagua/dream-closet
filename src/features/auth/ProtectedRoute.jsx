import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  DEFAULT_AUTHENTICATED_ROUTE,
  DEFAULT_PUBLIC_ROUTE,
  buildCurrentPath,
} from "../../app/routes/routePaths";

export const ProtectedRoute = ({
  children,
  inverse = false,
  redirectPath,
  roles = [],
}) => {
  const location = useLocation();
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
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
  }

  const isAuthenticated = !!user;
  const currentPath = buildCurrentPath(location);

  if (inverse) {
    if (isAuthenticated) {
      return (
        <Navigate
          to={redirectPath || DEFAULT_AUTHENTICATED_ROUTE}
          replace
          state={{ from: currentPath }}
        />
      );
    }

    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectPath || DEFAULT_PUBLIC_ROUTE}
        replace
        state={{ from: currentPath }}
      />
    );
  }

  if (roles.length > 0 && role && !roles.includes(role)) {
    return <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} replace />;
  }

  return <>{children}</>;
};
