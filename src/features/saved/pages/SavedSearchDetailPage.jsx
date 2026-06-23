import React from "react";
import { Box, Container, CssBaseline, Stack } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SavedSearchesList from "../components/SavedSearchesList";
import SavedItemsList from "../components/SavedItemsList";
import Footer from "../../../shared/ui/navigation/Footer";
import ProfileSearchPageHeader from "../../../shared/ui/navigation/ProfileSearchPageHeader";
import { colors, layout } from "../../../shared/ui/theme/designTokens";

const defaultTheme = createTheme();

function SavedItemsAndSearches() {
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
            "radial-gradient(circle at top, rgba(89,230,219,0.06), transparent 28%)",
        }}
      >
        <ProfileSearchPageHeader />

        <Box component="main" sx={{ flex: 1 }}>
          <Container maxWidth={layout.pageMax} sx={{ py: { xs: 4, md: 6 } }}>
            <Stack spacing={2}>
              <SavedSearchesList />
              <SavedItemsList />
            </Stack>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default SavedItemsAndSearches;
