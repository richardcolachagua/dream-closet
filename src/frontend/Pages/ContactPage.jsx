import React from "react";
import { Typography, Box } from "@mui/material";
import Header from "../Components/Headers/Header";
import Footer from "../Components/Footer";

const ContactPage = () => {
  return (
    <>
      <Header />
      <Box
        sx={{
          backgroundColor: "black",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingLeft: "90px",
          padding: "90px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Times New Roman",
          }}
        >
          Contact Us
        </Typography>
        <Box sx={{ marginTop: 2 }}>
          <Typography sx={{ color: "white" }}>
            Contact richardcwebdev@gmail.com for any questions
          </Typography>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ContactPage;
