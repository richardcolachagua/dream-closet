import React, { useState } from "react";
import CarouselSlide from "./CarouselSlide";
import { Box, Button, Grid } from "@mui/material";

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  return (
    <Box
      role="region"
      aria-label="carousel"
      className="tidal-carousel row nowrap nowrap-wrapper card-wrapper padding-top-1 padding-bottom-2 contain-width can-snap"
    >
      <Grid container spacing={2}>
        {slides.map((slide, index) => (
          <CarouselSlide key={index} {...slide} />
        ))}
      </Grid>
      <Button onClick={handlePrev}>Previous</Button>
      <Button onClick={handleNext}>Next</Button>
    </Box>
  );
};
