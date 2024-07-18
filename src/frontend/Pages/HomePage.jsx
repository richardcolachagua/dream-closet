import React from "react";
import { Container, Typography, Stack, Box, CssBaseline } from "@mui/material";
import Header from "../Components/Headers/Header.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AnimatedSearchBar from "../Components/AnimatedSearchBar";
import LayoutContainer from "../Components/Shared-Layout-Animation/LayoutContainer.jsx";
import Footer from "../Components/Footer.jsx";
import ProfileFeatures from "../Components/Profile-Features/Profile-Features.jsx";

const HomePage = () => {
  const defaultTheme = createTheme();

  return (
    <Box
      sx={{
        backgroundImage: `url(/assets/black_technology_gradient.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <Header />
        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "30px",
          }}
        >
          <CssBaseline />

          <Typography
            align="center"
            sx={{
              fontWeight: "bold",
              color: "white",
              fontFamily: "sans-serif",
              fontSize: { xs: "40px", sm: "60px", md: "80px", lg: "100px" },
            }}
          >
            Dream Closet
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{
              fontWeight: "bold",
              color: "white",
              fontFamily: "helvetica normal",
              fontSize: { xs: "10px", sm: "20px", md: "30px", lg: "40px" },
            }}
          >
            The Ultimate Fashion Search Engine, The New Way To Shop
          </Typography>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            alignItems="center"
            p={4}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: "bold",
                color: "turquoise",
                fontFamily: "Times New Roman",
                padding: { xs: "10px", md: "30px" },
                fontSize: { xs: "20px", sm: "30px", md: "40px", lg: "50px" },
              }}
            >
              Dream Closet is a clothing search engine that allows you to search
              for exactly what you are looking for. Looking for a specific set
              of heels? Dream Closet can find it. Looking for a blue and white
              spotted button down shirt for the summer? Dream Cloest can help
              you find it. Sign up today to get started.
            </Typography>
            <Container
              component="img"
              src="/assets/AI-driven_clothing_search.png"
              alt="ai-driven-clothing"
              sx={{
                width: { xs: "100%", sm: "400px" },
                height: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Stack>
          <Typography
            variant="h8"
            align="center"
            sx={{
              fontFamily: "Times New Roman",
              color: "white",
              fontWeight: "bold",
              fontSize: {
                xs: "2rem",
                sm: "3rem",
                md: "4rem",
              },
              padding: {
                xs: "30px 15px",
                sm: "40px 20px",
                md: "50px 30px",
                lg: "60px 40px",
              },
            }}
          >
            Example: "A red-orange colored strapless dress for a wedding with a
            slit on the left side"
          </Typography>
          <Container sx={{ padding: "20px" }}>
            <AnimatedSearchBar />
          </Container>
          <Container sx={{ padding: "50px" }}>
            <LayoutContainer />
          </Container>
        </Container>
        <Typography
          variant="h3"
          align="center"
          paddingBottom="100px"
          sx={{
            fontFamily: "Times New Roman",
            color: "white",
            fontWeight: "bold",
            fontSize: {
              xs: "2rem",
              sm: "3rem",
              md: "4rem",
            },
            padding: {
              xs: "30px 15px",
              sm: "40px 20px",
              md: "50px 30px",
              lg: "60px 40px",
            },
          }}
        >
          The more you use Dream Closet, the more it recognizes your taste in
          clothing.
        </Typography>

        <ProfileFeatures />
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default HomePage;
