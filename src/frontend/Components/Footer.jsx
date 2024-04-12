import { Typography, Stack } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        backgroundColor: "black",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Link to="/TOS">
        <Typography
          variant="h6"
          color="white"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          Terms of Use
        </Typography>
      </Link>
      <Link to="/ContactPage">
        <Typography
          variant="h6"
          color="white"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          Contact Us
        </Typography>
      </Link>
      <Link to="/Privacy Policy">
        <Typography
          variant="h6"
          color="white"
          align="center"
          sx={{
            fontWeight: "bold",
            fontFamily: "Helvetica Neue",
          }}
        >
          Privacy Policy
        </Typography>
      </Link>
    </Stack>
  );
};

export default Footer;
