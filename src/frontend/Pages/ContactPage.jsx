import React from "react";
import { Typography, Box } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <Box>
        <Typography
          variant="h1"
          marginTop={"70px"}
          marginLeft={"15px"}
          align="left"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Helvetica",
          }}
        >
          Contact us
        </Typography>
        <Box>
          <EmailIcon />
          <Typography
            variant="h4"
            marginLeft={"15px"}
            sx={{
              fontFamily: "Helvetica",
              color: "white",
            }}
          >
            For support, contact us at dreamcloset@gmail.com
          </Typography>
        </Box>
        <Footer />
      </Box>
    </>
  );
};

export default ContactPage;
