import React from "react";
import UserDescriptionInput from "../Components/UserInputDescription";
import { Box, Typography, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Footer from "../Components/Footer";

const SearchPage = () => {
  const defaultTheme = createTheme();

  return (
    <Box
      sx={{
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />

        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Personalized Recommendations
          </Typography>
        </Box>
        <Box
          sx={{
            padding: "50px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Search for any clothing
          </Typography>
          <UserDescriptionInput />
        </Box>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SearchPage;
