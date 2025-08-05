import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { LoadingCircle } from "../frontend/Components/LoadingCircle"; // fix import typo if needed

export const ProtectedRoute = ({ children, redirectPath = "/LoginPage" }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  if (!isLoaded) {
    return <LoadingCircle />;
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Future: If you want to support roles, check here

  return <>{children}</>;
};
