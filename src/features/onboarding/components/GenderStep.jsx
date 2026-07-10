import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { colors } from "../../../shared/ui/theme/designTokens";

const optionCardSx = (selected) => ({
  flex: 1,
  minHeight: 180,
  p: 2.5,
  borderRadius: "22px",
  border: `1px solid ${
    selected ? "rgba(89,230,219,0.28)" : "rgba(255,255,255,0.08)"
  }`,
  background: selected
    ? "linear-gradient(180deg, rgba(89,230,219,0.14), rgba(89,230,219,0.06))"
    : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  color: "white",
  textAlign: "left",
  justifyContent: "space-between",
  alignItems: "flex-start",
  boxShadow: selected ? "0 16px 40px rgba(0,0,0,0.18)" : "none",
  "&:hover": {
    borderColor: "rgba(89,230,219,0.28)",
    background:
      "linear-gradient(180deg, rgba(89,230,219,0.10), rgba(255,255,255,0.04))",
  },
});

const actionButtonSx = {
  minHeight: 50,
  px: 3.25,
  borderRadius: "999px",
  textTransform: "none",
  fontWeight: 800,
};

const GenderSelectStep = ({
  selectedGender = "",
  onChangeGender,
  onBack,
  onNext,
  loading = false,
  title = "How do you primarily shop for clothes?",
  description = "This helps us tailor brands, categories, and recommendations while still showing a broad range of results.",
  nextLabel = "Continue",
}) => {
  const canContinue = Boolean(selectedGender) && !loading;

  const options = [
    {
      value: "female",
      title: "Women’s sections",
      description:
        "Prioritize brands, fits, and categories commonly found in women’s shopping sections.",
    },
    {
      value: "male",
      title: "Men’s sections",
      description:
        "Prioritize brands, fits, and categories commonly found in men’s shopping sections.",
    },
  ];

  return (
    <Box>
      <Typography
        sx={{
          color: "white",
          fontWeight: 800,
          fontSize: { xs: "1.3rem", md: "1.55rem" },
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.68)",
          fontSize: "0.98rem",
          lineHeight: 1.7,
          mb: 3,
        }}
      >
        {description}
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        {options.map((option) => {
          const selected = selectedGender === option.value;

          return (
            <Button
              key={option.value}
              variant="outlined"
              onClick={() => onChangeGender?.(option.value)}
              sx={optionCardSx(selected)}
            >
              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: "1.04rem", mb: 1 }}
                >
                  {option.title}
                </Typography>
                <Typography
                  sx={{
                    color: selected
                      ? "rgba(255,255,255,0.86)"
                      : "rgba(255,255,255,0.7)",
                    lineHeight: 1.65,
                  }}
                >
                  {option.description}
                </Typography>
              </Box>

              <Box
                sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    fontSize: 20,
                    color: selected ? colors.accent : "rgba(255,255,255,0.24)",
                  }}
                />
                <Typography
                  sx={{
                    color: selected ? colors.accent : "rgba(255,255,255,0.58)",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                  }}
                >
                  {selected ? "Selected" : "Tap to choose"}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Stack>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.55)",
          fontSize: "0.88rem",
          mb: 4,
        }}
      >
        You can change this later in Settings, and this won’t limit your
        results.
      </Typography>

      <Stack direction="row" spacing={1.5} justifyContent="space-between">
        {onBack ? (
          <Button
            variant="text"
            onClick={onBack}
            startIcon={<WestRoundedIcon />}
            sx={{
              ...actionButtonSx,
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
              ...actionButtonSx,
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

export default GenderSelectStep;
