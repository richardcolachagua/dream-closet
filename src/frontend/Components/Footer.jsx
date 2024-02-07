import { Box, Typography } from "@mui/material";
import React from "react";

const Footer = () => {
  return (
    <Box sx={{ p: 1, mt: 50, backgroundColor: "white" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          m: "16px",
          p: "16px",
          gap: "50px",
        }}
      >
        <Typography
          variant="h6"
          color="black"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          A Sixth Sense Production
        </Typography>
        <Typography
          variant="h6"
          color="black"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          Terms of Use
        </Typography>
        <Typography
          variant="h6"
          color="black"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          Contact Us
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
