import React from "react";
import { Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { colors } from "../../../shared/ui/theme/designTokens";

const chipSx = (selected) => ({
  px: 1.2,
  py: 2.35,
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

const BrandMultiSelectStep = ({
  brandGroups = [],
  selectedBrands = [],
  onToggleBrand,
  onBack,
  onFinish,
  onSkip,
  loading = false,
  title = "Which brands feel most like you?",
  description = "Select favorite luxury, streetwear, athletic, and rising brands so Dream Closet can start learning your taste faster.",
  finishLabel = "Finish onboarding",
  skipLabel = "Skip for now",
  emptyMessage = "Choose a shopping preference first to unlock brand recommendations.",
}) => {
  const visibleGroups = brandGroups.filter(
    (group) => Array.isArray(group.brands) && group.brands.length > 0,
  );

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
            {selectedBrands.length} selected
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
        You can skip this for now, but selecting a few brands gives us a better
        starting point.
      </Typography>

      {visibleGroups.length > 0 ? (
        <Stack spacing={2.5} sx={{ mb: 4 }}>
          {visibleGroups.map((group) => (
            <Box
              key={group.title}
              sx={{
                p: 2.25,
                borderRadius: "20px",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: "1rem",
                  mb: 1.5,
                }}
              >
                {group.title}
              </Typography>

              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                {group.brands.map((brand) => {
                  const selected = selectedBrands.includes(brand);

                  return (
                    <Chip
                      key={brand}
                      label={brand}
                      clickable
                      onClick={() => onToggleBrand?.(brand)}
                      sx={chipSx(selected)}
                    />
                  );
                })}
              </Stack>

              <Divider sx={{ mt: 2, borderColor: "rgba(255,255,255,0.06)" }} />
            </Box>
          ))}
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

        <Stack direction="row" spacing={1.25}>
          {onSkip ? (
            <Button
              variant="outlined"
              onClick={onSkip}
              disabled={loading}
              sx={{
                minHeight: 50,
                px: 3,
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 800,
                color: "white",
                borderColor: "rgba(255,255,255,0.14)",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.22)",
                  backgroundColor: "rgba(255,255,255,0.04)",
                },
              }}
            >
              {skipLabel}
            </Button>
          ) : null}

          {onFinish ? (
            <Button
              variant="contained"
              onClick={onFinish}
              disabled={loading}
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
              {loading ? "Saving..." : finishLabel}
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

export default BrandMultiSelectStep;
