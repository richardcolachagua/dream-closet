import React from "react";
import { Typography, Box } from "@mui/material";
import Header from "../Components/Headers/Header";
import Footer from "../Components/Footer";

const TOSPage = () => {
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
          padding: "100px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "turquoise",
            fontFamily: "Times New Roman",
          }}
        >
          Terms of Service
        </Typography>
        <Box sx={{ marginTop: 2, padding: "10px" }}>
          <Typography></Typography>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default TOSPage;
