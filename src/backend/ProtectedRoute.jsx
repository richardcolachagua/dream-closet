import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";
import { LoadingCircle } from "../frontend/Components/LoadingCircle";

export const ProtectedRoute = ({
  children,
  roles = [],
  redirectPath = "/LoginPage",
}) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingCircle />;
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  //Role-based access control
  if (roles.length > 0 && (!role || !roles.includes(role))) {
  }
  return <>{children}</>;
};
