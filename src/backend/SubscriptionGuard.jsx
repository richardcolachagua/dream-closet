import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

const GuardLoader = () => (
  <Box
    sx={{
      minHeight: "40vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress />
  </Box>
);

export const SubscriptionGuard = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          navigate("/loginpage", {
            replace: true,
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          });
          return;
        }

        const snap = await getDoc(doc(db, "users", user.uid));
        const sub = snap.data()?.subscription;

        if (!active) return;

        if (sub?.status === "active") {
          setHasAccess(true);
        } else {
          navigate("/pricing", {
            replace: true,
            state: {
              from: `${location.pathname}${location.search}${location.hash}`,
            },
          });
        }
      } catch {
        if (!active) return;
        navigate("/homepage", { replace: true });
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    check();

    return () => {
      active = false;
    };
  }, [location.hash, location.pathname, location.search, navigate]);

  if (checking) return <GuardLoader />;
  return hasAccess ? children : null;
};
