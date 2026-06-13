import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../../backend/firebase/firebase";
import { ENABLE_BILLING } from "../../pricing/services/billingService";
import { ROUTES, buildCurrentPath } from "../../../app/routes/routePaths";

const LoadingFallback = () => null;

export const SubscriptionGuard = ({ children }) => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;

    const checkSubscription = async () => {
      if (!ENABLE_BILLING) {
        if (active) {
          setStatus("allowed");
          setChecking(false);
        }
        return;
      }

      const user = auth.currentUser;

      if (!user) {
        if (active) {
          setStatus("unauthenticated");
          setChecking(false);
        }
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const subscription = snap.data()?.subscription;

        if (!active) return;

        if (["active", "trialing"].includes(subscription?.status)) {
          setStatus("allowed");
        } else {
          setStatus("forbidden");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    checkSubscription();

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return <LoadingFallback />;
  }

  if (status === "unauthenticated") {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: buildCurrentPath(location) }}
      />
    );
  }

  if (status === "forbidden") {
    return (
      <Navigate
        to={ROUTES.PRICING}
        replace
        state={{ from: buildCurrentPath(location) }}
      />
    );
  }

  if (status === "error") {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};
