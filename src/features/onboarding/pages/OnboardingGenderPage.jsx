import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import OnboardingLayout from "../components/OnboardingLayout";
import GenderSelectStep from "../components/GenderStep";
import { ROUTES } from "../../../app/routes/routePaths";
import {
  EMPTY_ONBOARDING,
  buildOnboardingState,
} from "../utils/onboardingSchema";

const OnboardingGender = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [selectedGender, setSelectedGender] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchExistingProfile = async () => {
      if (authLoading) return;

      if (!currentUser) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data();
          const onboarding = data?.onboarding || EMPTY_ONBOARDING;

          if (onboarding?.completed) {
            navigate(ROUTES.SEARCH, { replace: true });
            return;
          }

          if (onboarding?.gender) {
            setSelectedGender(onboarding.gender);
          }
        }
      } catch (err) {
        console.error("Error loading onboarding data:", err);
        if (isMounted) {
          setError(
            "Something went wrong loading your profile. Please try again.",
          );
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    fetchExistingProfile();

    return () => {
      isMounted = false;
    };
  }, [authLoading, currentUser, navigate]);

  const handleContinue = async () => {
    if (!selectedGender || !currentUser) return;

    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      const existing = snap.exists()
        ? buildOnboardingState(snap.data()?.onboarding)
        : EMPTY_ONBOARDING;

      await setDoc(
        userRef,
        {
          onboarding: buildOnboardingState({
            ...existing,
            gender: selectedGender,
            completed: false,
          }),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      navigate(ROUTES.ONBOARDING_CATEGORIES, { replace: true });
    } catch (err) {
      console.error("Error saving gender:", err);
      setError("Could not save your selection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || initialLoading) {
    return (
      <>
        <CssBaseline />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#050505",
          }}
        >
          <CircularProgress sx={{ color: "#59e6db" }} />
        </Box>
      </>
    );
  }

  return (
    <OnboardingLayout
      currentStep={0}
      stepLabel="Step 1 of 3"
      title="Start shaping your Dream Closet"
      subtitle="Tell us how you usually shop so we can personalize your starting experience without narrowing what you can explore."
      helperText="You can update this later in Settings, and it won’t lock you into one type of result."
    >
      {error ? (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            backgroundColor: "rgba(161,53,68,0.12)",
            color: "white",
            border: "1px solid rgba(161,53,68,0.22)",
          }}
        >
          {error}
        </Alert>
      ) : null}

      <GenderSelectStep
        selectedGender={selectedGender}
        onChangeGender={setSelectedGender}
        onBack={() => navigate(ROUTES.HOME)}
        onNext={handleContinue}
        loading={saving}
      />
    </OnboardingLayout>
  );
};

export default OnboardingGender;
