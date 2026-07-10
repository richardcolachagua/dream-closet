import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, CssBaseline } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import OnboardingLayout from "../components/OnboardingLayout";
import BrandMultiSelectStep from "../components/BrandStep";
import { ROUTES } from "../../../app/routes/routePaths";
import {
  EMPTY_ONBOARDING,
  buildOnboardingState,
} from "../utils/onboardingSchema";

const sharedLuxury = [
  "Louis Vuitton",
  "Gucci",
  "Prada",
  "Dior",
  "Balenciaga",
  "Versace",
  "Off-White",
  "Fear of God",
  "Bottega Veneta",
  "Burberry",
  "Givenchy",
  "Valentino",
  "Fendi",
  "Rick Owens",
  "Maison Margiela",
  "Alexander McQueen",
  "Loewe",
];

const femaleLuxury = [
  "Miu Miu",
  "Chanel",
  "Jacquemus",
  "Zimmermann",
  "Self-Portrait",
  "Cult Gaia",
  "Dolce & Gabbana",
  "Sandy Liang",
];

const maleLuxury = [
  "Amiri",
  "Tom Ford",
  "Saint Laurent",
  "Brunello Cucinelli",
  "Zegna",
  "Bode",
  "Moncler",
];

const sharedStreetwear = [
  "Supreme",
  "Stüssy",
  "Palace",
  "Kith",
  "Carhartt WIP",
  "Essentials",
  "Noah",
  "Aimé Leon Dore",
  "Rhude",
  "Awake NY",
  "Stone Island",
  "Represent",
];

const femaleStreetwear = [
  "I.Am.Gia",
  "House of CB",
  "Jaded London",
  "Poster Girl",
  "Junya Watanabe",
];

const maleStreetwear = [
  "The Hundreds",
  "BAPE",
  "Corteiz",
  "Pleasures",
  "WTAPS",
  "Human Made",
];

const sharedAthletic = [
  "Nike",
  "Adidas",
  "New Balance",
  "Puma",
  "Under Armour",
  "Converse",
  "Reebok",
  "ASICS",
  "Salomon",
  "On",
  "Hoka",
];

const femaleAthletic = [
  "Lululemon",
  "Alo Yoga",
  "Gymshark",
  "Set Active",
  "Outdoor Voices",
];

const maleAthletic = [
  "Jordan Brand",
  "The North Face",
  "Patagonia",
  "Arc'teryx",
  "District Vision",
];

const sharedUpAndComing = [
  "Aimé Leon Dore",
  "Rhude",
  "Noah",
  "Daily Paper",
  "ERL",
  "Martine Rose",
  "Our Legacy",
  "Marine Serre",
];

const femaleUpAndComing = [
  "ALO x collabs",
  "SKIMS",
  "With Jéan",
  "Mirror Palais",
  "Rat & Boa",
];

const maleUpAndComing = [
  "Corteiz",
  "La Familia Forever",
  "Kidsuper",
  "Who Decides War",
  "PDF",
];

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
  const [completedState, setCompletedState] = useState(false);

  const brandGroups = buildBrandGroupsForGender(gender);

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

        if (
          !Array.isArray(onboarding?.categories) ||
          onboarding.categories.length === 0
        ) {
          navigate(ROUTES.ONBOARDING_CATEGORIES, { replace: true });
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

  const persistAndFinish = async (brandsToSave = selectedBrands) => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN, { replace: true });
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
            categories: existing.categories,
            brands: brandsToSave,
            completed: true,
          }),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setCompletedState(true);

      window.setTimeout(() => {
        navigate(ROUTES.SEARCH, { replace: true });
      }, 900);
    } catch (err) {
      console.error("Error saving brands:", err);
      setError("Could not save your brands. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    if (selectedBrands.length === 0) {
      setError("Pick a few brands you like, or skip for now.");
      return;
    }

    await persistAndFinish(selectedBrands);
  };

  const handleSkip = async () => {
    await persistAndFinish([]);
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
      currentStep={2}
      stepLabel="Step 3 of 3"
      title="Teach Dream Closet your taste"
      subtitle="Favorite brands help us rank results more intelligently and start personalizing recommendations from day one."
      helperText="You can skip this for now and still use the platform. Adding a few brands just gives us a better starting point."
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

      {completedState ? (
        <Box
          sx={{
            borderRadius: "24px",
            p: 4,
            textAlign: "center",
            backgroundColor: "rgba(89,230,219,0.08)",
            border: "1px solid rgba(89,230,219,0.18)",
          }}
        >
          <Typography sx={{ color: "#59e6db", fontWeight: 800, mb: 1 }}>
            You’re all set
          </Typography>
          <Typography
            sx={{
              color: "white",
              fontWeight: 800,
              fontSize: { xs: "1.4rem", md: "1.75rem" },
              mb: 1,
            }}
          >
            Your Dream Closet is getting smarter
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
            We’re saving your preferences and getting your search experience
            ready.
          </Typography>
        </Box>
      ) : (
        <BrandMultiSelectStep
          brandGroups={brandGroups}
          selectedBrands={selectedBrands}
          onToggleBrand={toggleBrand}
          onBack={() => navigate(ROUTES.ONBOARDING_CATEGORIES)}
          onFinish={handleFinish}
          onSkip={handleSkip}
          loading={saving}
        />
      )}
    </OnboardingLayout>
  );
};

export default OnboardingBrands;
