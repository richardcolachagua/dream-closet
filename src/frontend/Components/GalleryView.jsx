import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import "./style.css"; // Import CSS file for animations

const GalleryView = () => {
  const [isDown, setIsDown] = useState(false);
  const [prevX, setPrevX] = useState(0);
  const [prevY, setPrevY] = useState(0);
  const [currentX, setCurrentX] = useState(-300 / 2);
  const [currentY, setCurrentY] = useState(-400 / 2);
  const [currentXtmp, setCurrentXtmp] = useState(0);
  const [currentYtmp, setCurrentYtmp] = useState(0);

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

    setIsTouch(true); // Note: Consider how to handle touch events
  };

  const onUp = () => {
    setCurrentX(currentXtmp);
    setCurrentY(currentYtmp);
    setIsDown(false);
  };

  return (
    <section>
      <Box
        className="wrapper"
        sx={
          {
            // Your wrapper styles without animations
          }
        }
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
      >
        <Box
          className="images"
          sx={
            {
              // Your images container styles without animations
            }
          }
        >
          <Box
            className="column"
            sx={
              {
                // Your column styles without animations
              }
            }
          >
            {/* Render your images here */}
          </Box>
          {/* More columns */}
        </Box>
      </Box>
      <Typography variant="h1" sx={{}}>
        AI
      </Typography>
      <Typography variant="h2" sx={{}}>
        Gallery
      </Typography>
    </section>
  );
};

export default GalleryView;
