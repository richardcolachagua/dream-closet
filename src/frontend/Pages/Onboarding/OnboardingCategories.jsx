import React, { useEffect, useState } from "react";
import { CircularProgress, Alert, CssBaseline, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";
import OnboardingLayout from "./OnboardingLayout";
import CategoryMultiSelectStep from "./CategoryMultiSelectStep";

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
        navigate("/loginpage", { replace: true });
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
          navigate("/searchpage", { replace: true });
          return;
        }

        if (!onboarding?.gender) {
          navigate("/onboarding/gender", { replace: true });
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
      navigate("/loginpage", { replace: true });
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
      const existing = snap.exists() ? snap.data()?.onboarding || {} : {};

      await setDoc(
        userRef,
        {
          onboarding: {
            completed: false,
            gender,
            categories: selectedCategories,
            brands: Array.isArray(existing.brands) ? existing.brands : [],
          },
        },
        { merge: true },
      );

      navigate("/onboarding/brands", { replace: true });
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
    <>
      <CssBaseline />
      <OnboardingLayout
        stepLabel="STEP 2 OF 3"
        title="What do you like to wear?"
        subtitle="Choose the clothing categories you're most into. Dream Closet will use this to prioritize results and recommendations."
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
    </>
  );
};

export default OnboardingCategories;
