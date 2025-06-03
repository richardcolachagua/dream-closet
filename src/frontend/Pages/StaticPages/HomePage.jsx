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
          display: "flex",
          flexDirection: "column",
          backgroundImage: `url(/assets/black_technology_gradient.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          overflowY: "hidden",
        }}
      >
        <Header />
        <Box sx={{ flex: 1 }}>
          <Container
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              padding: "30px",
            }}
          >
            <Typography
              align="center"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "sans-serif",
                fontSize: { xs: "80px", sm: "100px", md: "120px", lg: "140px" },
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
                fontSize: { xs: "15px", sm: "25px", md: "30px", lg: "35px" },
              }}
            >
              The New Way To Search For Your Next Outfit
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems="center"
              justifyContent="center"
              p={4}
              sx={{ flexWrap: "wrap" }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  align="center"
                  sx={{
                    fontWeight: "bold",
                    color: "turquoise",
                    fontFamily: "Times New Roman",
                    padding: { xs: "10px", md: "30px" },
                    fontSize: {
                      xs: "15px",
                      sm: "25px",
                      md: "35px",
                      lg: "45px",
                    },
                    maxWidth: "600px",
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
                  display: "block",
                  width: "100%",
                  height: "auto",
                  maxWidth: "400px",
                  objectFit: "contain",
                  margin: "0 auto",
                }}
              />
            </Stack>
            <Typography
              variant="body1"
              align="center"
              sx={{
                fontFamily: "Times New Roman",
                color: "white",
                fontWeight: "bold",
                fontSize: {
                  xs: "1rem",
                  sm: "2rem",
                  md: "3rem",
                },
                padding: {
                  xs: "30px 15px",
                  sm: "40px 20px",
                  md: "50px 30px",
                  lg: "60px 40px",
                },
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
                fontFamily: "Times New Roman",
                color: "white",
                fontWeight: "bold",
                fontSize: {
                  xs: "1rem",
                  sm: "2rem",
                  md: "3rem",
                },
                padding: {
                  xs: "30px 15px",
                  sm: "40px 20px",
                  md: "50px 30px",
                  lg: "60px 40px",
                },
              }}
            >
              The more you use Dream Closet, the more it recognizes your taste
              in clothing.
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
              }}
            >
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
        <Footer />{" "}
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;
