import React from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  interactiveCardSx,
  sectionEyebrowSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

const featureCards = [
  {
    title: "Saved items",
    description:
      "Keep track of products you want to revisit, compare later, or return to when you're ready to buy.",
    icon: <BookmarkBorderRoundedIcon />,
    cta: "View saved items",
    to: ROUTES.SAVED,
  },
  {
    title: "Saved searches",
    description:
      "Come back to strong search ideas without rebuilding filters and prompts from scratch.",
    icon: <ManageSearchRoundedIcon />,
    cta: "Open saved searches",
    to: ROUTES.SAVED,
  },
  {
    title: "Style settings",
    description:
      "Refine the preferences Dream Closet uses to tailor results and future recommendations.",
    icon: <TuneRoundedIcon />,
    cta: "Go to settings",
    to: ROUTES.SETTINGS,
  },
];

export default function ProfileFeatures() {
  return (
    <Box sx={{ py: { xs: 4, md: 5 } }}>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <Box sx={sectionEyebrowSx}>Account tools</Box>

        <Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 850,
              fontSize: { xs: "1.8rem", md: "2.2rem" },
              lineHeight: 1.08,
              mb: 1,
            }}
          >
            Everything tied to your Dream Closet profile
          </Typography>

          <Typography
            sx={{
              color: colors.textSecondary,
              lineHeight: 1.75,
              maxWidth: 760,
            }}
          >
            Manage your saved ideas, revisit shopping directions, and update the
            preferences that shape your experience.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2.25}>
        {featureCards.map((card) => (
          <Grid key={card.title} item xs={12} md={4}>
            <Box
              sx={{
                ...interactiveCardSx,
                height: "100%",
                p: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: colors.accentSoft,
                  color: colors.accent,
                  mb: 2,
                }}
              >
                {card.icon}
              </Box>

              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.08rem",
                  mb: 1,
                }}
              >
                {card.title}
              </Typography>

              <Typography
                sx={{
                  color: colors.textSecondary,
                  lineHeight: 1.72,
                  mb: 2.5,
                }}
              >
                {card.description}
              </Typography>

              <Box sx={{ mt: "auto" }}>
                <Button
                  component={RouterLink}
                  to={card.to}
                  variant="outlined"
                  endIcon={<ArrowOutwardRoundedIcon />}
                  sx={secondaryButtonSx}
                >
                  {card.cta}
                </Button>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
