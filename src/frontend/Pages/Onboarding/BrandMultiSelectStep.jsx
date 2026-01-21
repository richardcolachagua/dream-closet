// src/frontend/Pages/Onboarding/BrandMultiSelectStep.jsx
import React from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const BrandMultiSelectStep = ({
  brandGroups,          // [{ title: string, brands: string[] }]
  selectedBrands,
  onToggleBrand,
  onBack,
  onFinish,
  loading,
}) => {
  const handleToggle = (brand) => {
    onToggleBrand && onToggleBrand(brand);
  };

  const canFinish = selectedBrands && selectedBrands.length > 0 && !loading;

  return (
    <>
      <Typography
        variant="h6"
        sx={{ textAlign: "center", mb: 3, fontWeight: "bold" }}
      >
        Which brands feel like you?
      </Typography>

      <Typography
        variant="body2"
        sx={{ textAlign: "center", mb: 4, color: "grey.400" }}
      >
        Select your favorite luxury, streetwear, athletic, and up-and-coming
        brands so Dream Closet can prioritize results that match your vibe.
      </Typography>

      <Stack spacing={3} sx={{ mb: 4 }}>
        {brandGroups.map(
          (group) =>
            group.brands.length > 0 && (
              <Box key={group.title}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, fontWeight: "bold", color: "grey.200" }}
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
                        onClick={() => handleToggle(brand)}
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
            )
        )}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        {onBack && (
          <Button
            variant="text"
            onClick={onBack}
            sx={{
              color: "grey.300",
              textTransform: "none",
            }}
          >
            Back
          </Button>
        )}

        {onFinish && (
          <Button
            variant="contained"
            onClick={onFinish}
            disabled={!canFinish}
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
            {loading ? "Saving..." : "Finish onboarding"}
          </Button>
        )}
      </Box>
    </>
  );
};

export default BrandMultiSelectStep;
