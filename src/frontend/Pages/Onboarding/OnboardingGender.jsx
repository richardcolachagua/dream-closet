// src/Components/Onboarding/OnboardingGender.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  CssBaseline,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";
import OnboardingLayout from "./OnboardingLayout";
import GenderSelectStep from "./GenderSelectStep";

const OnboardingGender = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [selectedGender, setSelectedGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (authLoading) return; // wait until auth finished

      if (!currentUser) {
        navigate("/loginpage");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.onboarding?.gender) {
            setSelectedGender(data.onboarding.gender);
          }
        }
      } catch (err) {
        console.error("Error loading onboarding data:", err);
        setError(
          "Something went wrong loading your profile. Please try again.",
        );
      } finally {
        setInitialLoading(false);
      }
    };

    fetchExistingProfile();
  }, [authLoading, currentUser, navigate]);

  const handleContinue = async () => {
    if (!selectedGender || !currentUser) return;

    setLoading(true);
    setError("");

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await setDoc(
        userRef,
        {
          onboarding: {
            gender: selectedGender,
            completed: false,
          },
        },
        { merge: true },
      );

      navigate("/onboarding/categories");
    } catch (err) {
      console.error("Error saving gender:", err);
      setError("Could not save your selection. Please try again.");
    } finally {
      setLoading(false);
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
              loading={loading}
            />
          </OnboardingLayout>
        </Container>
      </Box>
    </>
  );
};
export default OnboardingGender;
