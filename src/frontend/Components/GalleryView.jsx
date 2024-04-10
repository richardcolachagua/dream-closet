import React, { useState } from "react";
import { Box, Typography, CircularProgress, Button } from "@mui/material";

const GalleryView = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [prevX, setPrevX] = useState(0);
  const [prevY, setPrevY] = useState(0);
  const [currentX, setCurrentX] = useState(-300 / 2);
  const [currentY, setCurrentY] = useState(-400 / 2);
  const [currentXtmp, setCurrentXtmp] = useState(0);
  const [currentYtmp, setCurrentYtmp] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const onDown = (e) => {
    setPrevX(e.clientX);
    setPrevY(e.clientY);
    setIsDown(true);
  };

  const onMove = (e) => {
    if (!isDown) return;

    const deltaX = Math.min(Math.max(e.clientX - prevX + currentX, -300), 0);
    const deltaY = Math.min(Math.max(e.clientY - prevY + currentY, -400), 0);

    setCurrentXtmp(deltaX);
    setCurrentYtmp(deltaY);

    //setIsTouch(true); // Note: Consider how to handle touch events
  };

  const onUp = () => {
    setCurrentX(currentXtmp);
    setCurrentY(currentYtmp);
    setIsDown(false);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
        <Typography variant="h4">Gallery</Typography>
      </Box>
      <Box
        className="wrapper"
        sx={{
          display: " flex",
          justifyContent: " center",
          alignItems: "center",
          flexDirection: "column",
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
      >
        {images.length === 0 ? (
          <Box sx={{ my: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                transform: `translate(${currentX}px, ${currentY}px)`,
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
              <Button onClick={handlePrev}>Previous </Button>
              <Button onClick={handleNext}>Next</Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default GalleryView;
