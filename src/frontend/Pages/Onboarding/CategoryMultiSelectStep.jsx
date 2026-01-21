import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

const CategoryMultiSelectStep = ({
  categories,
  selectedCategories,
  onToggleCategory,
  onBack,
  onNext,
  loading,
}) => {
  const handleToggle = (category) => {
    onToggleCategory && onToggleCategory(category);
  };

  const canContinue =
    selectedCategories && selectedCategories.length > 0 && !loading;

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        What do you like to wear
      </Typography>
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          mb: 4,
          color: "grey.400",
        }}
      >
        Choose the clothing categories you're most into. Dream closet will use
        this to prioritize results and recommendations.
      </Typography>

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
              onClick={() => handleToggle(category)}
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
                  bgcolor: selected ? "turquoise" : "rgba(64, 224, 208, 0.12",
                },
              }}
            />
          );
        })}
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

        {onNext && (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!canContinue}
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
            {loading ? "Saving..." : "Next: Favorite Brands"}
          </Button>
        )}
      </Box>
    </>
  );
};

export default CategoryMultiSelectStep;
