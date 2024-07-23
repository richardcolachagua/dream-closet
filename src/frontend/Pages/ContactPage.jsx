import React from "react";
import { Typography, Box, CssBaseline, Container } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "../Components/Headers/Header";
import Footer from "../Components/Footer";

const ContactPage = () => {
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
        <Header />
        <CssBaseline />
        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "30px",
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "white",
              fontFamily: "Times New Roman",
            }}
          >
            Contact Us
          </Typography>
          <Box sx={{ marginTop: 2 }}>
            <Typography sx={{ color: "white" }}>
              Contact richardcwebdev@gmail.com for any questions
            </Typography>
          </Box>
        </Container>
        <Box sx={{ paddingTop: "380px" }}>
          <Footer />
        </Box>
      </ThemeProvider>
    </Box>
  );
};

export default ContactPage;
