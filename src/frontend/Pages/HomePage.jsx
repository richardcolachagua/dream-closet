import React from "react";
import { Typography, Box } from "@mui/material";
import UserDescriptionInput from "../Components/UserInputDescription";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const HomePage = () => {
  return (
    <>
      <Header />
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontWeight: "bold",
          color: "white",
          fontFamily: "Courier New, Andalé Mono, Courier, Lucida, Monaco",
        }}
      >
        Dream Closet
      </Typography>
      <Typography
        variant="h6"
        align="center"
        sx={{ fontWeight: "bold", fontFamily: "Andalé Mono", color: "white" }}
      >
        The clothing search engine to find exactly what you're looking for
      </Typography>
      <Box>
        <UserDescriptionInput />
        <Footer />
      </Box>
    </>
  );
};

export default HomePage;
