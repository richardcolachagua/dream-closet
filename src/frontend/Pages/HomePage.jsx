import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from "@mui/material";
import Header from "../Components/Header";

const HomePage = () => {
  // State to hold the array of images
  const [images, setImages] = useState([]);

  return (
    <>
      <Header /> {/* Render the Header component */}
      <Box sx={{ padding: "50px" }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Courier New, Andalé Mono, Courier, Lucida, Monaco",
          }}
        >
          Dream Closet {/* Display the title */}
        </Typography>
        <Stack direction="row" p={4} spacing={4}>
          <Typography
            variant="h6"
            align="center"
            sx={{ fontFamily: "Courier", color: "white" }}
          >
            Dream Closet employs advanced algorithms to understand your
            preferences. The more you use Dream Closet, the better it gets at
            understanding your taste in clothing, providing more accurate
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
          sx={{ fontFamily: "Courier", color: "white" }}
        >
          Example: "A red-orange colored strapless dress for a wedding with a
          slit on the left side" {/* Example user input */}
        </Typography>
      </Box>
    </>
  );
};

export default HomePage;
