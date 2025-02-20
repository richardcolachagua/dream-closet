import React from "react";
import { Box, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SavedSearches from "../../Components/Search-Components/SavedSearches";
import Footer from "../../Components/Footer";
import ProfileHeader from "../../Components/Headers/SavedSearchHeader";

const defaultTheme = createTheme();

const SavedItemsAndSearches = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease",
        minHeight: "100vh",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <ProfileHeader />
        <CssBaseline />
        <SavedSearches />
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SavedItemsAndSearches;
