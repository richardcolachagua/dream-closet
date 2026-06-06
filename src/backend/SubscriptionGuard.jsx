import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export const SubscriptionGuard = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/loginpage");
      const snap = await getDoc(doc(db, "users", user.uid));
      const sub = snap.data()?.subscription;
      if (sub?.status === "active") setHasAccess(true);
      else navigate("/pricing");
      setChecking(false);
    };
    check();
  }, []);

  if (checking) return null;
  return hasAccess ? children : null;
};
