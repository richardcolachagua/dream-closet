import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../backend/AuthContext";
import AppLoadingScreen from "../components/feedback/AppLoadingScreen";
import { ROUTES, buildCurrentPath } from "./routePaths";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: buildCurrentPath(location) }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
