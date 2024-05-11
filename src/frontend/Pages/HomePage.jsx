import React from "react";
import { Box, Typography, Stack } from "@mui/material";
import Header from "../Components/Header";
import { createTheme, ThemeProvider } from "@mui/material/styles";

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
          <Header /> {/* Render the Header component */}
          <Box sx={{ padding: "50px" }}>
            <Typography
              variant="h1"
              align="center"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "sans-serif",
              }}
            >
              Dream Closet
            </Typography>{" "}
            <Typography
              variant="h4"
              align="center"
              sx={{
                fontWeight: "bold",
                color: "white",
                fontFamily: "sans-serif",
              }}
            >
              The Ultimate Fashion Seach Engine
            </Typography>
            <Stack direction="row" p={4}>
              <Typography
                variant="h5"
                align="center"
                sx={{
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "sans-serif",
                  padding: "50px",
                }}
              >
                Dream Closet employs advanced algorithms to understand your
                preferences. The more you use Dream Closet, the better it gets
                at understanding your taste in clothing, providing more accurate
                results.
              </Typography>
              <img
                src="/assets/AI-driven_clothing_search.png"
                width="550"
                height="300"
                alt="ai-driven-clothing"
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
          </Box>
        </ThemeProvider>
      </Box>
    </>
  );
};

export default HomePage;
