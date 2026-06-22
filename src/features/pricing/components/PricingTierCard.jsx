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
        borderRadius: 4,
        border: highlighted
          ? "1px solid rgba(64,224,208,0.55)"
          : "1px solid rgba(255,255,255,0.12)",
        background: highlighted
          ? "linear-gradient(180deg, rgba(64,224,208,0.05) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.02)",
        p: { xs: 2.5, md: 3 },
        display: "flex",
        flexDirection: "column",
        boxShadow: highlighted ? "0 10px 24px rgba(0,0,0,0.18)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Stack spacing={2.25}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
          spacing={1.25}
        >
          <Box sx={{ minWidth: 0, pr: { sm: 1 } }}>
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "2.15rem" },
                lineHeight: 1.05,
              }}
            >
              {name}
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                mt: 0.75,
                fontSize: { xs: "1rem", md: "1.05rem" },
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>

          {(badge || isCurrent) && (
            <Chip
              label={isCurrent ? "Current plan" : badge}
              size="small"
              sx={{
                mt: { xs: 0.5, sm: 0 },
                ml: { sm: 1 },
                backgroundColor: highlighted
                  ? "rgba(64,224,208,0.18)"
                  : "rgba(255,255,255,0.08)",
                color: highlighted ? "turquoise" : "white",
                fontWeight: 700,
                flexShrink: 0,
              }}
            />
          )}
        </Stack>

        <Typography
          sx={{
            color: highlighted ? "turquoise" : "white",
            fontWeight: 900,
            fontSize: { xs: "2.15rem", md: "2.85rem" },
            lineHeight: 1,
          }}
        >
          {priceLabel}
        </Typography>

        <Stack spacing={1.2}>
          {features.map((feature) => (
            <Stack
              key={feature}
              direction="row"
              spacing={1.1}
              alignItems="flex-start"
            >
              <CheckCircleIcon
                sx={{
                  color: "turquoise",
                  mt: "2px",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{ color: "rgba(255,255,255,0.86)", lineHeight: 1.45 }}
              >
                {feature}
              </Typography>
            </Stack>
          ))}
        </Stack>

        {footnote && (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.56)",
              fontSize: "0.92rem",
              lineHeight: 1.45,
              pt: 0.5,
            }}
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
            mt: 1,
            minHeight: 48,
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 800,
            fontSize: "1rem",
            bgcolor: highlighted ? "turquoise" : "transparent",
            color: highlighted ? "black" : "white",
            borderColor: highlighted ? "transparent" : "rgba(255,255,255,0.18)",
            boxShadow: "none",
            "&:hover": {
              bgcolor: highlighted ? "#35d8cb" : "rgba(255,255,255,0.06)",
              borderColor: highlighted ? "transparent" : "turquoise",
              boxShadow: "none",
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
      </Stack>
    </Box>
  );
}

export default PricingTierCard;
