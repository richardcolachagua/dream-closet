import { Box, Typography, List } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

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
        <List>
          <Link to="/TOS">
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
          </Link>
          <Link to="/ContactPage">
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
          </Link>
        </List>
      </Box>
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
    </Box>
  );
};

export default Footer;
