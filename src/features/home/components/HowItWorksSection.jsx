import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { colors, typography } from "../../../shared/ui/theme/designTokens";
import {
  featureCardSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const steps = [
  {
    number: "01",
    title: "Describe the item",
    body: "Tell Dream Closet what you want in plain language — style, color, silhouette, occasion, or mood.",
  },
  {
    number: "02",
    title: "Refine the results",
    body: "Apply filters, switch views, and narrow options without losing the original intent of your search.",
  },
  {
    number: "03",
    title: "Save what fits your taste",
    body: "Keep track of favorite pieces and searches so your shopping journey gets easier over time.",
  },
];

function HowItWorksSection() {
  return (
    <Box>
      <Box sx={sectionEyebrowSx}>How it works</Box>
      <Typography
        sx={{
          color: colors.textPrimary,
          fontWeight: 800,
          fontSize: typography.sectionTitle,
          mt: 2,
          mb: 4,
        }}
      >
        Search like you think
      </Typography>

      <Grid container spacing={3}>
        {steps.map((step) => (
          <Grid item xs={12} md={4} key={step.number}>
            <Box sx={featureCardSx}>
              <Typography
                sx={{
                  color: colors.accent,
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  mb: 1.5,
                }}
              >
                {step.number}
              </Typography>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.12rem",
                  mb: 1,
                }}
              >
                {step.title}
              </Typography>
              <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
                {step.body}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default HowItWorksSection;
