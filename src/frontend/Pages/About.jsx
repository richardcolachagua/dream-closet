import React from "react";
import { Box, Typography } from "@mui/material";

const About = () => {
  return (
    <Box>
      <Typography>
        Dream Closet is an AI application that recognizes your taste in clothing
        the more that you use it to search for what you're looking for
      </Typography>

      <Typography>How Does It Work?</Typography>

      <Typography>
        Its very simple. Lets say you're looking for a wedding outfit for an
        upcoming one in a few months. You want something blue, made of satin
        material, strapless, with a slit on the left side. All you have to do is
        type that into the searchbar, and Dream Closet will return a list of
        dresses from different sites that match what you're looking for. From
        there, you can go through the sites and order what you want if you see
        something you like.
      </Typography>
    </Box>
  );
};

export default About;
