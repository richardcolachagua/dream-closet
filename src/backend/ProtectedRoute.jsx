import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { LoadingCircle } from "../frontend/Components/LoadingCircle";

export const ProtectedRoute = ({
  children,
  roles = [],
  redirectPath = "/loginpage",
  unauthorizedPath = "/homepage",
  inverse = false,
}) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingCircle />;
  }

  if (inverse) {
    return user ? <Navigate to={redirectPath} replace /> : <>{children}</>;
  }

  if (!user) {
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  if (roles.length > 0 && (!role || !roles.includes(role))) {
    return <Navigate to={unauthorizedPath} replace />;
  }

  return <>{children}</>;
};
