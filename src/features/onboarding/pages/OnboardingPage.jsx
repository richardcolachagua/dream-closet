import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AnimatedPageShell from "../Shared/AnimatedPageShell";
import OnboardingProgress from "../../Components/Onboarding/OnboardingProgress";
import GenderSelectStep from "../../Components/Onboarding/GenderSelectStep";
import CategoryMultiSelectStep from "../../Components/Onboarding/CategoryMultiSelectStep";
import BrandMultiSelectStep from "../../Components/Onboarding/BrandMultiSelectStep";
import { auth, db } from "../../../backend/firebase";

const MotionBox = motion(Box);

const stepVariants = {
  initial: { opacity: 0, x: 24, scale: 0.985 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35 } },
  exit: { opacity: 0, x: -24, scale: 0.985, transition: { duration: 0.22 } },
};

const CATEGORY_OPTIONS = [
  "Outerwear",
  "Dresses",
  "Tops",
  "Bottoms",
  "Denim",
  "Suits",
  "Knitwear",
  "Shoes",
  "Bags",
  "Activewear",
  "Streetwear",
  "Accessories",
];

const BRAND_GROUPS = [
  {
    title: "Luxury",
    brands: ["Saint Laurent", "Prada", "Bottega Veneta", "Loewe", "Gucci"],
  },
  {
    title: "Streetwear",
    brands: ["Supreme", "Stussy", "Aime Leon Dore", "Kith", "Fear of God"],
  },
  {
    title: "Athletic",
    brands: ["Nike", "Adidas", "Alo", "Lululemon", "New Balance"],
  },
  {
    title: "Emerging / Contemporary",
    brands: ["Jacquemus", "Ganni", "Coperni", "ERL", "The Row"],
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ type: "success", message: "" });

  const currentUser = auth.currentUser;

  useEffect(() => {
    const loadExistingPreferences = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          const onboarding = data?.onboarding || {};

          setSelectedGender(onboarding.gender || "");
          setSelectedCategories(onboarding.categories || []);
          setSelectedBrands(onboarding.brands || []);
        }
      } catch (error) {
        console.error("Failed to load onboarding data", error);
      }
    };

    loadExistingPreferences();
  }, [currentUser]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
  };

  const handleFinish = async () => {
    if (!currentUser) {
      setToast({
        type: "error",
        message: "You must be logged in to continue.",
      });
      return;
    }

    setLoading(true);

    try {
      const userRef = doc(db, "users", currentUser.uid);

      await setDoc(
        userRef,
        {
          onboarding: {
            completed: true,
            gender: selectedGender,
            categories: selectedCategories,
            brands: selectedBrands,
            completedAt: new Date().toISOString(),
          },
        },
        { merge: true },
      );

      setToast({
        type: "success",
        message: "Your style profile is saved.",
      });

      setTimeout(() => navigate("/search"), 700);
    } catch (error) {
      console.error("Failed to save onboarding", error);
      setToast({
        type: "error",
        message: "We couldn’t save your preferences. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <GenderSelectStep
            selectedGender={selectedGender}
            onChangeGender={setSelectedGender}
            onNext={() => setCurrentStep(1)}
            loading={loading}
          />
        );
      case 1:
        return (
          <CategoryMultiSelectStep
            categories={CATEGORY_OPTIONS}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
            loading={loading}
          />
        );
      case 2:
        return (
          <BrandMultiSelectStep
            brandGroups={BRAND_GROUPS}
            selectedBrands={selectedBrands}
            onToggleBrand={toggleBrand}
            onBack={() => setCurrentStep(1)}
            onFinish={handleFinish}
            loading={loading}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    selectedGender,
    selectedCategories,
    selectedBrands,
    loading,
  ]);

  return (
    <AnimatedPageShell maxWidth="sm">
      <Box
        sx={{
          borderRadius: 4,
          border: "1px solid rgba(64,224,208,0.16)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          p: { xs: 3, md: 4 },
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            color: "white",
            mb: 1,
          }}
        >
          Build your Dream Closet profile
        </Typography>

        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "rgba(255,255,255,0.72)",
            mb: 4,
          }}
        >
          Tell us how you shop so we can make search feel more personal from day
          one.
        </Typography>

        <OnboardingProgress currentStep={currentStep} />

        <AnimatePresence mode="wait">
          <MotionBox
            key={currentStep}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {stepContent}
          </MotionBox>
        </AnimatePresence>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button
            variant="text"
            onClick={() => navigate("/search")}
            sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}
          >
            Skip for now
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={Boolean(toast.message)}
        autoHideDuration={5000}
        onClose={() => setToast({ type: "success", message: "" })}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast({ type: "success", message: "" })}
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </AnimatedPageShell>
  );
};

export default OnboardingPage;
