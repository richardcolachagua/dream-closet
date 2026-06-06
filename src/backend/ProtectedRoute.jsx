import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { LoadingCircle } from "../frontend/Components/LoadingCircle";

export const ProtectedRoute = ({
  children,
  roles = [],
  redirectPath = "/LoginPage",
  unauthorizedPath = "/unauthorized",
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingCircle />;
  }

  if (!user) {
    return (
      <Navigate to={redirectPath} replace state={{ from: location.pathname }} />
    );
  }

  // Role-based access control
  if (roles.length > 0 && (!role || !roles.includes(role))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <>{children}</>;
};
