import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function PricingTierCard({
  tier,
  isCurrent = false,
  loading = false,
  onSelect,
}) {
  const {
    name,
    priceLabel,
    description,
    features = [],
    ctaLabel,
    badge,
    highlighted = false,
    disabled = false,
    footnote,
  } = tier;

  const resolvedCta = isCurrent ? "Current plan" : ctaLabel;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        borderRadius: 4,
        border: highlighted
          ? "1px solid turquoise"
          : "1px solid rgba(255,255,255,0.12)",
        background: highlighted
          ? "linear-gradient(180deg, rgba(64,224,208,0.08) 0%, rgba(255,255,255,0.03) 100%)"
          : "rgba(255,255,255,0.02)",
        p: { xs: 3, md: 4 },
        display: "flex",
        flexDirection: "column",
        boxShadow: highlighted
          ? "0 0 0 1px rgba(64,224,208,0.12), 0 18px 40px rgba(0,0,0,0.28)"
          : "none",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={1.5}
      >
        <Box>
          <Typography variant="h5" sx={{ color: "white", fontWeight: 800 }}>
            {name}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)", mt: 1 }}>
            {description}
          </Typography>
        </Box>

        {(badge || isCurrent) && (
          <Chip
            label={isCurrent ? "Current plan" : badge}
            sx={{
              backgroundColor: highlighted
                ? "rgba(64,224,208,0.2)"
                : "rgba(255,255,255,0.08)",
              color: highlighted ? "turquoise" : "white",
              fontWeight: 700,
            }}
          />
        )}
      </Stack>

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography
          variant="h3"
          sx={{ color: highlighted ? "turquoise" : "white", fontWeight: 900 }}
        >
          {priceLabel}
        </Typography>
      </Box>

      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {features.map((feature) => (
          <Stack
            key={feature}
            direction="row"
            spacing={1.25}
            alignItems="flex-start"
          >
            <CheckCircleIcon
              sx={{ color: "turquoise", mt: "2px", fontSize: 20 }}
            />
            <Typography sx={{ color: "rgba(255,255,255,0.86)" }}>
              {feature}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {footnote && (
        <Typography
          sx={{ color: "rgba(255,255,255,0.56)", fontSize: "0.9rem", mt: 3 }}
        >
          {footnote}
        </Typography>
      )}

      <Button
        variant={highlighted ? "contained" : "outlined"}
        fullWidth
        disabled={disabled || isCurrent || loading}
        onClick={() => onSelect?.(tier)}
        sx={{
          mt: 3,
          minHeight: 50,
          borderRadius: "16px",
          textTransform: "none",
          fontWeight: 800,
          fontSize: "1rem",
          bgcolor: highlighted ? "turquoise" : "transparent",
          color: highlighted ? "black" : "white",
          borderColor: highlighted ? "transparent" : "rgba(255,255,255,0.18)",
          "&:hover": {
            bgcolor: highlighted ? "#35d8cb" : "rgba(255,255,255,0.06)",
            borderColor: highlighted ? "transparent" : "turquoise",
          },
          "&.Mui-disabled": {
            bgcolor: highlighted
              ? "rgba(64,224,208,0.35)"
              : "rgba(255,255,255,0.06)",
            color: highlighted ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.4)",
            borderColor: "rgba(255,255,255,0.12)",
          },
        }}
      >
        {loading ? "Loading..." : resolvedCta}
      </Button>
    </Box>
  );
}

export default PricingTierCard;
