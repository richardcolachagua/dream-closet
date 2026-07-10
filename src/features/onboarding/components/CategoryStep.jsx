import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { colors } from "../../../shared/ui/theme/designTokens";

const chipSx = (selected) => ({
  px: 1.2,
  py: 2.4,
  borderRadius: "999px",
  border: `1px solid ${
    selected ? "rgba(89,230,219,0.28)" : "rgba(255,255,255,0.10)"
  }`,
  backgroundColor: selected
    ? "rgba(89,230,219,0.16)"
    : "rgba(255,255,255,0.04)",
  color: selected ? colors.accent : "rgba(255,255,255,0.9)",
  fontWeight: selected ? 800 : 600,
  "&:hover": {
    backgroundColor: selected
      ? "rgba(89,230,219,0.20)"
      : "rgba(255,255,255,0.08)",
  },
});

const CategoryMultiSelectStep = ({
  categories = [],
  selectedCategories = [],
  onToggleCategory,
  onBack,
  onNext,
  loading = false,
  title = "What do you like to wear?",
  description = "Choose the clothing categories you care about most. We’ll use them to prioritize search results and early recommendations.",
  nextLabel = "Continue to brands",
  emptyMessage = "Choose a shopping preference first to unlock category recommendations.",
}) => {
  const hasCategories = categories.length > 0;
  const canContinue = selectedCategories.length > 0 && !loading;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{
            color: "white",
            fontWeight: 800,
            fontSize: { xs: "1.3rem", md: "1.55rem" },
          }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            px: 1.4,
            py: 0.75,
            borderRadius: "999px",
            backgroundColor: "rgba(89,230,219,0.10)",
            border: "1px solid rgba(89,230,219,0.18)",
          }}
        >
          <Typography
            sx={{ color: colors.accent, fontWeight: 800, fontSize: "0.84rem" }}
          >
            {selectedCategories.length} selected
          </Typography>
        </Box>
      </Stack>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.68)",
          fontSize: "0.98rem",
          lineHeight: 1.7,
          mb: 1.25,
        }}
      >
        {description}
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "0.88rem",
          mb: 3,
        }}
      >
        Pick as many as you want. You can change them later in Settings.
      </Typography>

      {hasCategories ? (
        <Stack
          direction="row"
          flexWrap="wrap"
          spacing={1}
          useFlexGap
          sx={{ mb: 4 }}
        >
          {categories.map((category) => {
            const selected = selectedCategories.includes(category);

            return (
              <Chip
                key={category}
                label={category}
                clickable
                onClick={() => onToggleCategory?.(category)}
                sx={chipSx(selected)}
              />
            );
          })}
        </Stack>
      ) : (
        <Box
          sx={{
            mb: 4,
            p: 2.25,
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "rgba(255,255,255,0.68)",
            }}
          >
            {emptyMessage}
          </Typography>
        </Box>
      )}

      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        {onBack ? (
          <Button
            variant="text"
            onClick={onBack}
            startIcon={<WestRoundedIcon />}
            sx={{
              minHeight: 50,
              px: 3,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 800,
              color: "rgba(255,255,255,0.74)",
            }}
          >
            Back
          </Button>
        ) : (
          <Box />
        )}

        {onNext ? (
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!canContinue}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              minHeight: 50,
              px: 3.25,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 800,
              backgroundColor: colors.accent,
              color: "#061111",
              "&:hover": {
                backgroundColor: colors.accentHover || "#34cfc0",
              },
            }}
          >
            {loading ? "Saving..." : nextLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
};

export default CategoryMultiSelectStep;
