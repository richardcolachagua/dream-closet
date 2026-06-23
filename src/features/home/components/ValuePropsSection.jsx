import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { colors, typography } from "../../../shared/ui/theme/designTokens";
import {
  featureCardSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const items = [
  {
    icon: <TravelExploreIcon sx={{ color: colors.accent, fontSize: 28 }} />,
    title: "Describe what you want",
    body: "Search in natural language instead of manually combing through dozens of store menus and category trees.",
  },
  {
    icon: <StorefrontIcon sx={{ color: colors.accent, fontSize: 28 }} />,
    title: "Shop across more sources",
    body: "Dream Closet is built to surface relevant clothing from a broader universe of retailers in one place.",
  },
  {
    icon: <AutoAwesomeIcon sx={{ color: colors.accent, fontSize: 28 }} />,
    title: "Get smarter over time",
    body: "Saved items, searches, and onboarding preferences help power a more tailored discovery experience.",
  },
];

function ValuePropsSection() {
  return (
    <Box>
      <Box sx={sectionEyebrowSx}>Why Dream Closet</Box>
      <Typography
        sx={{
          color: colors.textPrimary,
          fontWeight: 800,
          fontSize: typography.sectionTitle,
          mt: 2,
          mb: 1.25,
        }}
      >
        A better way to search for clothes online
      </Typography>
      <Typography
        sx={{
          color: colors.textSecondary,
          maxWidth: 760,
          mb: 4,
          fontSize: typography.sectionBody,
        }}
      >
        Dream Closet combines natural-language search, retailer breadth, and
        personalization so shopping feels more precise and less exhausting.
      </Typography>

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Box sx={featureCardSx}>
              <Box sx={{ mb: 1.75 }}>{item.icon}</Box>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  mb: 1,
                }}
              >
                {item.title}
              </Typography>
              <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
                {item.body}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default ValuePropsSection;
