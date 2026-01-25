// src/frontend/Pages/Onboarding/OnboardingCategories.jsx
import React, { useEffect, useState } from "react";
import { CircularProgress, Alert, CssBaseline, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";

import OnboardingLayout from "./OnboardingLayout";
import CategoryMultiSelectStep from "./CategoryMultiSelectStep";

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
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

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
      if (authLoading) return;

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
  }, [authLoading, currentUser, navigate]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleNext = async () => {
    if (!currentUser) {
      navigate("/loginpage");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Pick at least one category you like.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          onboarding: {
            gender,
            categories: selectedCategories,
          },
        },
        { merge: true },
      );

      navigate("/onboarding/brands");
    } catch (err) {
      console.error("Error saving categories:", err);
      setError("Could not save your categories. Please try again.");
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
    <OnboardingLayout
      title="What do you like to wear?"
      subtitle="Choose the clothing categories you’re most into."
      stepLabel="Step 2 of 3"
    >
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, bgcolor: "#2b0000", color: "error.main" }}
        >
          {error}
        </Alert>
      )}

      <CategoryMultiSelectStep
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onBack={() => navigate("/onboarding/gender")}
        onNext={handleNext}
        loading={saving}
      />
    </OnboardingLayout>
  );
};

export default OnboardingCategories;
