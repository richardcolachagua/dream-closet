import React, { useEffect, useState } from "react";
import { CircularProgress, Alert, Box, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";
import OnboardingLayout from "./OnboardingLayout";
import BrandMultiSelectStep from "./BrandMultiSelectStep";

const sharedLuxury = [
  "Louis Vuitton",
  "Gucci",
  "Prada",
  "Dior",
  "Balenciaga",
  "Versace",
  "Off-White",
  "Fear of God",
];

const femaleLuxury = ["Miu Miu", "Chanel", "Jacquemus", "Zimmermann"];
const maleLuxury = ["Amiri", "Tom Ford", "Saint Laurent"];

const sharedStreetwear = [
  "Supreme",
  "Stüssy",
  "Palace",
  "Kith",
  "Carhartt WIP",
  "Essentials",
];

const femaleStreetwear = ["I.Am.Gia", "House of CB"];
const maleStreetwear = ["The Hundreds", "BAPE"];

const sharedAthletic = [
  "Nike",
  "Adidas",
  "New Balance",
  "Puma",
  "Under Armour",
  "Converse",
  "Reebok",
];

const femaleAthletic = ["Lululemon", "Alo Yoga", "Gymshark"];
const maleAthletic = ["Jordan Brand", "The North Face", "Patagonia"];

const sharedUpAndComing = ["Aimé Leon Dore", "Rhude", "Noah", "Daily Paper"];
const femaleUpAndComing = ["ALO x collabs", "SKIMS"];
const maleUpAndComing = ["Corteiz", "La Familia Forever"];

export const buildBrandGroupsForGender = (gender) => {
  if (!gender) return [];

  const isFemale = gender === "female";
  const isMale = gender === "male";

  return [
    {
      title: "Luxury",
      brands: [
        ...sharedLuxury,
        ...(isFemale ? femaleLuxury : []),
        ...(isMale ? maleLuxury : []),
      ],
    },
    {
      title: "Streetwear",
      brands: [
        ...sharedStreetwear,
        ...(isFemale ? femaleStreetwear : []),
        ...(isMale ? maleStreetwear : []),
      ],
    },
    {
      title: "Athletic",
      brands: [
        ...sharedAthletic,
        ...(isFemale ? femaleAthletic : []),
        ...(isMale ? maleAthletic : []),
      ],
    },
    {
      title: "Up & Coming",
      brands: [
        ...sharedUpAndComing,
        ...(isFemale ? femaleUpAndComing : []),
        ...(isMale ? maleUpAndComing : []),
      ],
    },
  ];
};

const OnboardingBrands = () => {
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth();

  const [gender, setGender] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const brandGroups = buildBrandGroupsForGender(gender);

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

        if (
          !Array.isArray(onboarding?.categories) ||
          onboarding.categories.length === 0
        ) {
          navigate("/onboarding/categories", { replace: true });
          return;
        }

        setGender(onboarding.gender);
        setSelectedBrands(
          Array.isArray(onboarding.brands) ? onboarding.brands : [],
        );
      } catch (err) {
        console.error("Error loading onboarding brands:", err);
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

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleFinish = async () => {
    if (!currentUser) {
      navigate("/loginpage", { replace: true });
      return;
    }

    if (selectedBrands.length === 0) {
      setError("Pick at least a couple of brands you like.");
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
            completed: true,
            gender,
            categories: Array.isArray(existing.categories)
              ? existing.categories
              : [],
            brands: selectedBrands,
          },
        },
        { merge: true },
      );

      navigate("/searchpage");
    } catch (err) {
      console.error("Error saving brands:", err);
      setError("Could not save your brands. Please try again.");
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
        stepLabel="STEP 3 OF 3"
        title="Which brands feel like you?"
        subtitle="Select your favorite luxury, streetwear, athletic, and up-and-coming brands so Dream Closet can prioritize results that match your vibe."
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <BrandMultiSelectStep
          brandGroups={brandGroups}
          selectedBrands={selectedBrands}
          onToggleBrand={toggleBrand}
          onBack={() => navigate("/onboarding/categories")}
          onFinish={handleFinish}
          loading={saving}
        />
      </OnboardingLayout>
    </>
  );
};

export default OnboardingBrands;
