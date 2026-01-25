import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthContext";

export const useOnboardingStatus = () => {
    const { user, loading: authLoading } = useAuth();
    const [onboarding, setOnboarding] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            if (authLoading) return;
            if (!user) {
                setOnboarding(null);
                setLoading(false);
                return;
            }

            try {
                const ref = doc(db, "users", user.uid);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setOnboarding(data.onboarding || {});
                } else {
                    setOnboarding()
                }
            } finally {
                setLoading(false);
            }
        };

        run();
    }, [user, authLoading]);

    return { onboarding, loading }
}