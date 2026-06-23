import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { colors, typography } from "../../../shared/ui/theme/designTokens";
import {
  featureCardSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

function RetailerTrustSection() {
  return (
    <Box>
      <Box sx={sectionEyebrowSx}>Retailer reach</Box>
      <Typography
        sx={{
          color: colors.textPrimary,
          fontWeight: 800,
          fontSize: typography.sectionTitle,
          mt: 2,
          mb: 1.25,
        }}
      >
        Built to search beyond a single storefront
      </Typography>
      <Typography
        sx={{
          color: colors.textSecondary,
          maxWidth: 760,
          mb: 4,
          fontSize: typography.sectionBody,
        }}
      >
        Dream Closet is designed for broad fashion discovery, helping users move
        from one vague idea to relevant pieces from multiple retail sources.
      </Typography>

      <Grid container spacing={3}>
        {[
          "Cross-store product discovery",
          "More useful comparison workflows",
          "A clearer path from inspiration to purchase",
        ].map((text) => (
          <Grid item xs={12} md={4} key={text}>
            <Box sx={featureCardSx}>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
                {text}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default RetailerTrustSection;
