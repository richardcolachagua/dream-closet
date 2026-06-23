import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  CssBaseline,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import OnboardingLayout from "../components/OnboardingLayout";
import GenderSelectStep from "../components/GenderStep";
import {
  EMPTY_ONBOARDING,
  buildOnboardingState,
} from "../utils/onboardingSchema";

const DEFAULT_ONBOARDING = EMPTY_ONBOARDING;

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
        navigate("/loginpage", { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!isMounted) return;

        if (snap.exists()) {
          const data = snap.data();
          const onboarding = data?.onboarding || DEFAULT_ONBOARDING;

          if (onboarding?.completed) {
            navigate("/searchpage", { replace: true });
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

      navigate("/onboarding/categories");
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
            bgcolor: "black",
          }}
        >
          <CircularProgress sx={{ color: "turquoise" }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          bgcolor: "black",
          color: "white",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <OnboardingLayout
            title="Tell Dream Closet about you"
            subtitle="Start by letting us know which clothing styles to prioritize."
            stepLabel="Step 1 of 3"
          >
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3, bgcolor: "#2b0000", color: "error.main" }}
              >
                {error}
              </Alert>
            )}

            <GenderSelectStep
              selectedGender={selectedGender}
              onChangeGender={setSelectedGender}
              onBack={() => navigate("/homepage")}
              onNext={handleContinue}
              loading={saving}
            />
          </OnboardingLayout>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingGender;
