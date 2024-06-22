import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import Header from "../Components/Header";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AnimatedSearchBar from "../Components/AnimatedSearchBar";
import LayoutContainer from "../Components/Shared-Layout-Animation/LayoutContainer.jsx";
import Footer from "../Components/Footer.jsx";

const HomePage = () => {
  const defaultTheme = createTheme();

  return (
    <>
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
          <Box sx={{ padding: "30px" }}>
            <Typography
              align="center"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "sans-serif",
                fontSize: "100px",
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
              }}
            >
              The Ultimate Fashion Search Engine, The New Way To Shop
            </Typography>
            <Stack direction="row" p={4}>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "turquoise",
                  fontFamily: "Times New Roman",
                  padding: "50px",
                }}
              >
                Dream Closet employs advanced algorithms to understand your
                preferences. The more you use Dream Closet, the better it gets
                at understanding your taste in clothing, providing more accurate
                results.
              </Typography>
              <Box
                component="img"
                src="/assets/AI-driven_clothing_search.png"
                alt="ai-driven-clothing"
                sx={{
                  width: "400px",
                  height: "600px",
                  alignSelf: "center",
                  marginTop: "auto",
                }}
              />
            </Stack>
            <Typography
              variant="h6"
              align="center"
              sx={{ fontFamily: "sans-serif", color: "white" }}
            >
              Example: "A red-orange colored strapless dress for a wedding with
              a slit on the left side" {/* Example user input */}
            </Typography>
            <Box>
              <AnimatedSearchBar />
              <LayoutContainer />
            </Box>
          </Box>
          <Typography
            variant="h5"
            align="center"
            padding="15px"
            sx={{ fontFamily: "sans-serif", color: "white" }}
          >
            The more you use it, the more it recognizes your taste in clothing.
          </Typography>
        </ThemeProvider>
        <Footer />
      </Box>
    </>
  );
};

export default HomePage;
