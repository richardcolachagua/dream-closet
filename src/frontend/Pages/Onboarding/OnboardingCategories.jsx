// frontend/Pages/Onboarding/OnboardingCategories.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
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
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";

const femaleCategories = [
  "Tops",
  "Blouses",
  "Crop Tops",
  "Sweaters",
  "Dresses",
  "Skirts",
  "Jeans",
  "Pants",
  "Shorts",
  "Jumpsuits",
  "Activewear",
  "Outerwear",
  "Heels",
  "Sandals",
  "Sneakers",
  "Boots",
  "Bags",
  "Accessories",
];

const maleCategories = [
  "T‑Shirts",
  "Button‑Ups",
  "Polos",
  "Sweaters",
  "Hoodies",
  "Jeans",
  "Chinos",
  "Trousers",
  "Shorts",
  "Activewear",
  "Outerwear",
  "Sneakers",
  "Boots",
  "Dress Shoes",
  "Sandals",
  "Hats",
  "Accessories",
];

const OnboardingCategories = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [gender, setGender] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const categories =
    gender === "female"
      ? femaleCategories
      : gender === "male"
      ? maleCategories
      : [];

  useEffect(() => {
    const loadOnboarding = async () => {
      if (!currentUser) {
        navigate("/loginpage");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          setError("Could not find your profile. Please sign up again.");
          return;
        }
        const data = snap.data();
        const onboarding = data.onboarding || {};

        if (!onboarding.gender) {
          // If gender not set, send them back to first step
          navigate("/onboarding/gender");
          return;
        }
        setGender(onboarding.gender);
        setSelectedCategories(onboarding.categories || []);
      } catch (err) {
        console.error("Error loading onboarding categories:", err);
        setError("Something went wrong loading your preferences.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadOnboarding();
  }, [currentUser, navigate]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = async () => {
    if (!currentUser) {
      navigate("/loginpage");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Pick at least oen category you like.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "uesrs", currentUser.uid);
      await setDoc(
        userRef,
        {
          onboarding: {
            gender,
            categories: selectedCategories,
          },
        },
        { merge: true }
      );
      navigate("/onboarding/brands");
    } catch (err) {
      console.error("Error saving categories:", err);
      setError("Could not save your categories. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
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
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 6,
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              mb: 2,
            }}
          >
            What do you like to wear?
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              textAlign: "center",
              mb: 3,
              color: "grey.300",
            }}
          >
            Choose the clothing categories you’re most into. Dream Closet will
            use this to prioritize results and recommendations.
          </Typography>

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
            Step 2 of 3
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: "#2b0000",
                color: "error.main",
              }}
            >
              {error}
            </Alert>
          )}

          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={1}
            useFlexGap
            sx={{
              justifyContent: "center",
              mb: 4,
            }}
          >
            {categories.map((category) => {
              const selected = selectedCategories.includes(category);
              return (
                <Chip
                  key={category}
                  label={category}
                  clickable
                  onClick={() => toggleCategory(category)}
                  sx={{
                    m: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: "999px",
                    border: "1px solid turquoise",
                    bgcolor: selected ? "turquoise" : "transparent",
                    color: selected ? "black" : "grey.100",
                    fontWeight: selected ? "bold" : "normal",
                    "&:hover": {
                      bgcolor: selected
                        ? "turquoise"
                        : "rgba(64, 224, 208, 0.12)",
                    },
                  }}
                />
              );
            })}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="text"
              onClick={() => navigate("/onboarding/gender")}
              sx={{
                color: "grey.300",
                textTransform: "none",
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleNext}
              disabled={saving}
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
              {saving ? "Saving..." : "Next: Favorite Brands"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingCategories;
