import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import OnboardingLayout from "../components/OnboardingLayout";
import CategoryMultiSelectStep from "../components/CategoryStep";
import { ROUTES } from "../../../app/routes/routePaths";
import {
  EMPTY_ONBOARDING,
  buildOnboardingState,
} from "../utils/onboardingSchema";

export const femaleCategories = [
  "Tops",
  "Blouses",
  "Tank Tops",
  "Crop Tops",
  "Bodysuits",
  "Sweaters",
  "Cardigans",
  "Hoodies",
  "Blazers",
  "Dresses",
  "Mini Dresses",
  "Midi Dresses",
  "Maxi Dresses",
  "Skirts",
  "Mini Skirts",
  "Midi Skirts",
  "Jeans",
  "Pants",
  "Trousers",
  "Leggings",
  "Shorts",
  "Jumpsuits",
  "Rompers",
  "Matching Sets",
  "Activewear",
  "Loungewear",
  "Sleepwear",
  "Swimwear",
  "Outerwear",
  "Jackets",
  "Coats",
  "Heels",
  "Sandals",
  "Sneakers",
  "Boots",
  "Flats",
  "Loafers",
  "Bags",
  "Jewelry",
  "Accessories",
  "Sunglasses",
  "Hats",
];

export const maleCategories = [
  "T-Shirts",
  "Graphic Tees",
  "Button-Ups",
  "Polos",
  "Sweaters",
  "Cardigans",
  "Hoodies",
  "Crewnecks",
  "Blazers",
  "Suits",
  "Jeans",
  "Chinos",
  "Trousers",
  "Cargo Pants",
  "Joggers",
  "Shorts",
  "Denim Shorts",
  "Activewear",
  "Loungewear",
  "Sleepwear",
  "Swimwear",
  "Outerwear",
  "Jackets",
  "Coats",
  "Vests",
  "Sneakers",
  "Boots",
  "Dress Shoes",
  "Loafers",
  "Sandals",
  "Hats",
  "Bags",
  "Watches",
  "Accessories",
  "Sunglasses",
];

const OnboardingCategories = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [gender, setGender] = useState("");
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
    let isMounted = true;

    const loadOnboarding = async () => {
      if (authLoading) return;

      if (!currentUser) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (!isMounted) return;

        if (!snap.exists()) {
          setError("Could not find your profile. Please sign up again.");
          return;
        }

        const data = snap.data();
        const onboarding = data?.onboarding || {};

        if (onboarding?.completed) {
          navigate(ROUTES.SEARCH, { replace: true });
          return;
        }

        if (!onboarding?.gender) {
          navigate(ROUTES.ONBOARDING_GENDER, { replace: true });
          return;
        }

        setGender(onboarding.gender);
        setSelectedCategories(
          Array.isArray(onboarding.categories) ? onboarding.categories : [],
        );
      } catch (err) {
        console.error("Error loading onboarding categories:", err);
        if (isMounted) {
          setError("Something went wrong loading your preferences.");
        }
      } finally {
        if (isMounted) {
          setInitialLoading(false);
        }
      }
    };

    loadOnboarding();

    return () => {
      isMounted = false;
    };
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
      navigate(ROUTES.LOGIN, { replace: true });
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
      const snap = await getDoc(userRef);
      const existing = snap.exists()
        ? buildOnboardingState(snap.data()?.onboarding)
        : EMPTY_ONBOARDING;

      await setDoc(
        userRef,
        {
          onboarding: buildOnboardingState({
            ...existing,
            gender,
            categories: selectedCategories,
            completed: false,
          }),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      navigate(ROUTES.ONBOARDING_BRANDS, { replace: true });
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
      currentStep={1}
      stepLabel="Step 2 of 3"
      title="Build your style profile"
      subtitle="Choose the categories you reach for most often so we can rank better results earlier and improve recommendations over time."
      helperText="Select as many as you want. These preferences help prioritize results, but they won’t hide everything else."
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

      <CategoryMultiSelectStep
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        onBack={() => navigate(ROUTES.ONBOARDING_GENDER)}
        onNext={handleNext}
        loading={saving}
      />
    </OnboardingLayout>
  );
};

export default OnboardingCategories;
