import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase/firebase";
import { useAuth } from "../auth/AuthContext";

const DEFAULT_ONBOARDING = {
  completed: false,
  gender: "",
  categories: [],
  brands: [],
};

const normalizeOnboarding = (raw = {}) => ({
  completed: Boolean(raw?.completed),
  gender: raw?.gender || "",
  categories: Array.isArray(raw?.categories) ? raw.categories : [],
  brands: Array.isArray(raw?.brands) ? raw.brands : [],
});

export const useOnboardingStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [onboarding, setOnboarding] = useState(DEFAULT_ONBOARDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (authLoading) return;

      if (!user) {
        if (active) {
          setOnboarding(DEFAULT_ONBOARDING);
          setLoading(false);
        }
        return;
      }

      if (active) {
        setLoading(true);
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!active) return;

        if (snap.exists()) {
          const data = snap.data();
          setOnboarding(normalizeOnboarding(data?.onboarding));
        } else {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } catch {
        if (active) {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  return { onboarding, loading };
};
