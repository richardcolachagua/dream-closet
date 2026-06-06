import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

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
    let isMounted = true;

    const run = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setOnboarding(DEFAULT_ONBOARDING);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);

        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data();
          setOnboarding(normalizeOnboarding(data?.onboarding));
        } else {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } catch (e) {
        console.error("[useOnboardingStatus] error:", e);

        if (isMounted) {
          setOnboarding(DEFAULT_ONBOARDING);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  return { onboarding, loading };
};
