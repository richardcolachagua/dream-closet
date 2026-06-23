import React from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { colors, typography } from "../../../shared/ui/theme/designTokens";
import {
  featureCardSx,
  primaryButtonSx,
  secondaryButtonSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

function PersonalizationSection() {
  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12} md={7}>
        <Box sx={{ ...featureCardSx, height: "100%" }}>
          <Box sx={sectionEyebrowSx}>Personalization</Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: typography.sectionTitle,
              mt: 2,
              mb: 1.25,
            }}
          >
            The more you use it, the better it gets
          </Typography>
          <Typography
            sx={{
              color: colors.textSecondary,
              lineHeight: 1.75,
              maxWidth: 680,
            }}
          >
            Onboarding preferences, saved searches, and favorite items create
            the foundation for smarter recommendations and more relevant
            discovery over time.
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} md={5}>
        <Box
          sx={{
            ...featureCardSx,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 800,
                fontSize: "1.3rem",
                mb: 1,
              }}
            >
              Premium value
            </Typography>
            <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
              Upgrade paths can support deeper discovery, more search power, and
              stronger personalized experiences as Dream Closet expands.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{ mt: 3 }}
          >
            <Button
              component={RouterLink}
              to="/signuppage"
              variant="contained"
              sx={primaryButtonSx}
            >
              Create account
            </Button>
            <Button
              component={RouterLink}
              to="/pricing"
              variant="outlined"
              sx={secondaryButtonSx}
            >
              View plans
            </Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}

export default PersonalizationSection;
