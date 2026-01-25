// src/Components/Onboarding/OnboardingGender.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
  { merge: true }
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
            <GenderSelectStep
              selectedGender={selectedGender}
              onChangeGender={setSelectedGender}
              onBack={() => navigate("/homepage")}
              onNext={handleContinue}
              loading={loading}
            />
          </OnboardingLayout>
          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "center",
              mb: 4,
              color: "grey.300",
            }}
          >
            Start by letting us know which clothing styles to prioritize.
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, bgcolor: "#2b0000", color: "error.main" }}
            >
              {error}
            </Alert>
          )}

          <Typography
            variant="subtitle2"
            sx={{
              textAlign: "center",
              mb: 3,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "grey.400",
            }}
          >
            Step 1 of 3
          </Typography>

          <Typography
            variant="h6"
            sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}
          >
            How do you primarily shop for clothes?
          </Typography>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            sx={{ justifyContent: "center", mb: 4 }}
          >
            <Button
              variant={selectedGender === "female" ? "contained" : "outlined"}
              onClick={() => setSelectedGender("female")}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: "999px",
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                bgcolor:
                  selectedGender === "female" ? "turquoise" : "transparent",
                color: selectedGender === "female" ? "black" : "grey.100",
                borderColor: "turquoise",
                "&:hover": {
                  bgcolor:
                    selectedGender === "female"
                      ? "turquoise"
                      : "rgba(64, 224, 208, 0.12)",
                },
              }}
            >
              I shop mostly in women&apos;s sections
            </Button>

            <Button
              variant={selectedGender === "male" ? "contained" : "outlined"}
              onClick={() => setSelectedGender("male")}
              sx={{
                flex: 1,
                py: 1.5,
                borderRadius: "999px",
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                bgcolor:
                  selectedGender === "male" ? "turquoise" : "transparent",
                color: selectedGender === "male" ? "black" : "grey.100",
                borderColor: "turquoise",
                "&:hover": {
                  bgcolor:
                    selectedGender === "male"
                      ? "turquoise"
                      : "rgba(64, 224, 208, 0.12)",
                },
              }}
            >
              I shop mostly in men&apos;s sections
            </Button>
          </Stack>

          <Typography
            variant="body2"
            sx={{ textAlign: "center", mb: 4, color: "grey.500" }}
          >
            This helps tailor brands, categories, and recommendations.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="text"
              onClick={() => navigate("/homepage")}
              sx={{
                color: "grey.300",
                textTransform: "none",
              }}
            >
              Back to Home
            </Button>

            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={!selectedGender || loading}
              sx={{
                ml: "auto",
                px: 4,
                py: 1.2,
                borderRadius: "999px",
                textTransform: "none",
                fontSize: 16,
                fontWeight: "bold",
                bgcolor: "turquoise",
                color: "black",
                "&:hover": {
                  bgcolor: "#00b4aa",
                },
              }}
            >
              {loading ? "Saving..." : "Next: Clothing Types"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingGender;
