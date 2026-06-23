import React from "react";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import Header from "../../../shared/ui/navigation/PublicHeader.jsx";
import Footer from "../../../shared/ui/navigation/Footer.jsx";
import SearchHeroDemo from "../components/SearchHeroDemo.jsx";
import ValuePropsSection from "../components/ValuePropsSection.jsx";
import HowItWorksSection from "../components/HowItWorksSection.jsx";
import RetailerTrustSection from "../components/RetailerTrustSection.jsx";
import PersonalizationSection from "../components/PersonalizationSection.jsx";
import {
  colors,
  layout,
  spacing,
  typography,
} from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
  sectionEyebrowSx,
  heroPanelSx,
} from "../../../shared/ui/theme/componentStyles";

const defaultTheme = createTheme();

function HomePage() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.background,
          color: colors.textPrimary,
          backgroundImage:
            "radial-gradient(circle at top, rgba(89,230,219,0.08), transparent 30%)",
        }}
      >
        <Header />

        <Box component="main" sx={{ flex: 1 }}>
          <Container maxWidth={layout.pageMax} sx={{ py: spacing.section }}>
            <Stack spacing={4}>
              <Box
                sx={{
                  ...heroPanelSx,
                  px: { xs: 2.5, md: 5 },
                  py: { xs: 4, md: 6 },
                }}
              >
                <Stack spacing={3} alignItems="center" textAlign="center">
                  <Box sx={sectionEyebrowSx}>Fashion search, rethought</Box>

                  <Typography
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1,
                      fontSize: typography.heroTitle,
                      maxWidth: 980,
                    }}
                  >
                    Find the clothes you actually mean to search for
                  </Typography>

                  <Typography
                    sx={{
                      color: colors.textSecondary,
                      fontSize: typography.heroBody,
                      maxWidth: layout.textMaxWidth,
                      lineHeight: 1.75,
                    }}
                  >
                    Dream Closet helps you search for clothing in natural
                    language, discover options across more retail sources, and
                    build a smarter shopping experience around your taste.
                  </Typography>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                    <Button
                      component={RouterLink}
                      to="/freesearchpage"
                      variant="contained"
                      sx={primaryButtonSx}
                    >
                      Try a free search
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/signuppage"
                      variant="outlined"
                      sx={secondaryButtonSx}
                    >
                      Create your account
                    </Button>
                  </Stack>

                  <Box sx={{ width: "100%", maxWidth: 760, pt: 1 }}>
                    <SearchHeroDemo />
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ py: spacing.sectionTight }}>
                <ValuePropsSection />
              </Box>

              <Box sx={{ py: spacing.sectionTight }}>
                <HowItWorksSection />
              </Box>

              <Box sx={{ py: spacing.sectionTight }}>
                <RetailerTrustSection />
              </Box>

              <Box sx={{ py: spacing.sectionTight }}>
                <PersonalizationSection />
              </Box>
            </Stack>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default HomePage;
