import React from "react";
import { Box, Typography } from "@mui/material";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const About = () => {
  return (
    <>
      <Header />
      <Box sx={{ padding: "100px" }}>
        <Typography
          padding="10px"
          sx={{ fontSize: 24, color: "white", fontWeight: "bold" }}
        >
          What is Dream Closet?
        </Typography>
        <Typography padding="10px" sx={{ fontSize: 14, color: "white" }}>
          Dream Closet is an AI application that recognizes your taste in
          clothing the more that you use it to search for what you're looking
          for.
        </Typography>

        <Typography
          padding="10px"
          sx={{ fontSize: 24, color: "white", fontWeight: "bold" }}
        >
          How Does It Work?
        </Typography>

        <Typography padding="10px" sx={{ fontSize: 14, color: "white" }}>
          Its very simple. Lets say you're looking for a wedding outfit for an
          upcoming one in a few months. You want something blue, made of satin
          material, strapless, with a slit on the left side. All you have to do
          is type that into the searchbar, and Dream Closet will return a list
          of dresses from different sites that match what you're looking for.
          From there, you can go through the sites and order what you want if
          you see something you like.
        </Typography>
        <Typography
          padding="10px"
          sx={{ fontSize: 14, color: "white", fontWeight: "bold" }}
        >
          The more you use Dream Closet, the more it starts to understand your
          taste in clothing, and gives more accurate results for clothing.
        </Typography>
      </Box>
      <Footer />
    </>
  );
};

export default About;
