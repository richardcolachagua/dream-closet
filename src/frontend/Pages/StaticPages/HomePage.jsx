import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Stack,
  Box,
  CssBaseline,
  Button,
} from "@mui/material";
import Header from "../../Components/Headers/Header.jsx";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AnimatedSearchBar from "../../Components/AnimatedSearchBar.jsx";
import LayoutContainer from "../../Components/Shared-Layout-Animation/LayoutContainer.jsx";
import Footer from "../../Components/Footer.jsx";
import ProfileFeatures from "../../Components/Profile-Features/Profile-Features.jsx";
import { Link as RouterLink } from "react-router-dom";
import { keyframes } from "@mui/system";

const fadeFromAbove = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeUp = keyframes`
0% {opacity: 0; transform: translateY(20px); }
100% {opacity: 1; transform: translateY(0); }
`;

const HomePage = () => {
  const defaultTheme = createTheme();

  // state to trigger animation on mount
  const [show, setShow] = useState(false);

  // Typing effect states
  const fullText = "The New Way To Search For Your Next Outfit";
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    // Trigger animation once on mount
    setShow(true);
  }, []);

  useEffect(() => {
    // Typewriter effect for subheading
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
      }
    }, 50); // Speed here -> 50ms per letter
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          // backgroundImage: `url(/assets/black_technology_gradient.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundColor: "black",
        }}
      >
        <Header />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Container
            maxWidth="lg"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              py: 4,
            }}
          >
            <Typography
              align="center"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "sans-serif",
                fontSize: { xs: "2vw", sm: "4vw", md: "6vw", lg: "8vw" },
                animation: show
                  ? `${fadeFromAbove} 0.5s ease-out forwards`
                  : "none",
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
                fontFamily: "helvetica",
                fontSize: { xs: "15px", sm: "25px", md: "30px", lg: "35px" },
                mt: 2,
                whiteSpace: "pre-wrap",
              }}
            >
              {typedText}
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  width: "1ch",
                  bgcolor: "white",
                  animation: "blink 1s step-start infinite",
                  "@keyframes blink": {
                    "50%": { opacity: 0 },
                  },
                }}
              />
            </Typography>
          </Container>

          {/* FULL-WIDTH BLACK BACKGROUND SECTION */}
          <Box
            sx={{
              width: "100%",
              py: 6,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                alignItems="center"
                justifyContent="center"
                flexWrap="wrap"
              >
                <Box
                  sx={{
                    flex: 1,
                    maxWidth: "600px",
                    animation: `${fadeUp} 0.8s ease-out both`,
                  }}
                >
                  <Typography
                    variant="h4"
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color: "turquoise",
                      fontFamily: "helvetica",
                      fontSize: {
                        xs: "15px",
                        sm: "25px",
                        md: "35px",
                        lg: "45px",
                      },
                      background:
                        "linear-gradient(90deg, turquoise, violet, turquoise)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "gradientMove 3s linear infinite",
                      "@keyframes gradientMove": {
                        to: { backgroundPosition: "200% center" },
                      },
                    }}
                  >
                    Dream Closet is a clothing search engine that allows you to
                    search for exactly what you are looking for. Looking for a
                    specific set of heels? Dream Closet can find it. Looking for
                    a blue and white spotted button down shirt for the summer?
                    Dream Closet can help you find it. Sign up today to get
                    started.
                  </Typography>
                </Box>
                <Box
                  component="img"
                  src="/assets/AI-driven_clothing_search.png"
                  alt="ai-driven-clothing"
                  sx={{
                    width: "100%",
                    maxWidth: "400px",
                    objectFit: "contain",
                    mx: "auto",
                  }}
                />
              </Stack>
            </Container>
          </Box>

          <Container
            maxWidth="lg"
            sx={{ flex: 1, display: "flex", flexDirection: "column", py: 4 }}
          >
            <Box>
              <AnimatedSearchBar />
              <LayoutContainer />
            </Box>
            <Typography
              variant="h3"
              align="center"
              sx={{
                fontFamily: "helvetica",
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "2rem", md: "3rem" },
                my: 4,
              }}
            >
              The more you use Dream Closet, the more it recognizes your taste
              in clothing.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to="/freesearchpage"
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontSize: "25px",
                  fontWeight: "bold",
                  backgroundColor: "turquoise",
                  color: "black",
                }}
              >
                Try a Search Here
              </Button>
            </Box>
          </Container>

          <ProfileFeatures />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
