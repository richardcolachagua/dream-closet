import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Typography,
  Stack,
  Chip,
  CircularProcess,
  Alert,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { useAuth } from "../../../backend/AuthContext";

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

const OnboardingBrands = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [gender, setGender] = useState(null);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  //Build brand groups dynamically based on gender
  const buildBrandGroups = () => {
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

  const brandGroups = buildBrandGroups();

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
        setSelectedBrands(onboarding.brands || []);
      } catch (err) {
        console.error("Error loading onboarding brands:", err);
        setError("Something went wrong loading your preferences.");
      } finally {
        setInitialLoading(false);
      }
    };

    loadOnboarding();
  }, [currentUser, navigate]);

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleFinish = async () => {
    if (!currentUser) {
      navigate("/loginpage");
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
      await setDoc(
        userRef,
        {
          onboarding: {
            gender,
            brands: selectedBrands,
            // categories are already set on previous step; keep them merged
            completed: true,
          },
        },
        { merge: true },
      );

      // After onboarding you can send them to search or profile
      navigate("/searchpage");
    } catch (err) {
      console.error("Error saving brands:", err);
      setError("Could not save your brands. Please try again.");
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
          <CircularProcess
            sx={{
              color: "turquoise",
            }}
          />
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
            sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
          >
            Which brands do you like?
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", mb: 3, color: "grey.300" }}
          >
            Select your favorite brands so Dream Closet can prioritize results
            that match your style.
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
            Step 3 of 3
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, bgcolor: "#2b0000", color: "error.main" }}
            >
              {error}
            </Alert>
          )}

          <Stack spacing={3} sx={{ mb: 4 }}>
            {brandGroups.map(
              (group) =>
                group.brands.length > 0 && (
                  <Box key={group.title}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        fontWeight: "bold",
                        color: "grey.200",
                      }}
                    >
                      {group.title}
                    </Typography>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      spacing={1}
                      useFlexGap
                    >
                      {group.brands.map((brand) => {
                        const selected = selectedBrands.includes(brand);
                        return (
                          <Chip
                            key={brand}
                            label={brand}
                            clickable
                            onClick={() => toggleBrand(brand)}
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
                    <Divider sx={{ mt: 2, mb: 1, borderColor: "grey.800" }} />
                  </Box>
                ),
            )}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="text"
              onClick={() => navigate("/onboarding/categories")}
              sx={{
                color: "grey.300",
                textTransform: "none",
              }}
            >
              Back
            </Button>

            <Button
              variant="contained"
              onClick={handleFinish}
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
              {saving ? "Saving..." : "Finish onboarding"}
            </Button>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingBrands;
