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

const HomePage = () => {
  const defaultTheme = createTheme();

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url(/assets/black_technology_gradient.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
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
                fontSize: { xs: "12vw", sm: "10vw", md: "8vw", lg: "6vw" },
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
              }}
            >
              The New Way To Search For Your Next Outfit
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems="center"
              justifyContent="center"
              flexWrap="wrap"
            >
              <Box sx={{ flex: 1, maxWidth: "600px" }}>
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
                  }}
                >
                  Dream Closet is a clothing search engine that allows you to
                  search for exactly what you are looking for. Looking for a
                  specific set of heels? Dream Closet can find it. Looking for a
                  blue and white spotted button down shirt for the summer? Dream
                  Closet can help you find it. Sign up today to get started.
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
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontFamily: "helvetica",
                color: "white",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "2rem", md: "3rem" },
                my: 4,
              }}
            >
              Example: "A pink strapless dress with a slit on the left side"
            </Typography>
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
