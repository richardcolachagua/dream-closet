import { Typography, Stack, Box } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          backgroundColor: "black",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Link to="/TOSPage" style={{ textDecoration: "none" }}>
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
        <Link to="/ContactPage" style={{ textDecoration: "none" }}>
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
        <Link to="/privacypolicypage" style={{ textDecoration: "none" }}>
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "black",
          justifyContent: "center",
          paddingBottom: "10px",
        }}
      >
        <Typography
          variant="h4"
          color="white"
          align="center"
          padding="5px"
          sx={{
            fontWeight: "bold",
            fontFamily: "Times New Roman",
          }}
        >
          A Sixth Sense Production
        </Typography>
      </Box>
    </>
  );
};

export default Footer;
