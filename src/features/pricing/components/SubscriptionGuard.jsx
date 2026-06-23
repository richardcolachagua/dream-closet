import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import {
  normalizeSubscription,
  hasActiveSubscription,
} from "../utils/subscriptionSchema";

const SubscriptionGuard = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadSubscription = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const userData = snap.exists() ? snap.data() : {};
        const normalized = normalizeSubscription(userData?.subscription);
        if (isMounted) {
          setSubscription(normalized);
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
        if (isMounted) {
          setSubscription(normalizeSubscription(null));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  if (authLoading || loading) {
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

  if (!user) {
    return <Navigate to="/loginpage" replace />;
  }

  if (!hasActiveSubscription(subscription)) {
    return <Navigate to="/pricing" replace />;
  }

  return children;
};

export default SubscriptionGuard;
