import React, { useState } from "react";
import { Typography, Box, Pagination, Stack } from "@mui/material";
import UserDescriptionInput from "../Components/UserInputDescription";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import GalleryView from "../Components/GalleryView";

const HomePage = () => {
  // State to hold the array of images
  const [images, setImages] = useState([]);

  return (
    <>
      <Header /> {/* Render the Header component */}
      <Box sx={{ padding: "50px" }}>
        <Typography
          variant="h3"
          align="center"
          sx={{
            fontWeight: "bold",
            color: "white",
            fontFamily: "Courier New, Andalé Mono, Courier, Lucida, Monaco",
          }}
        >
          Dream Closet {/* Display the title */}
        </Typography>
        <Typography
          variant="h6"
          align="center"
          sx={{ fontFamily: "Courier", color: "white" }}
        >
          The clothing search engine to find exactly what you're looking for.
          Just search for a certain type of article of clothing, and get
          results. {/* Description of the website */}
        </Typography>
        <Typography>
          Example: "A red-orange colored strapless dress for a wedding with a
          slit on the left side" {/* Example user input */}
        </Typography>
      </Box>
      <Box>
        <UserDescriptionInput setImages={setImages} />{" "}
        {/* Render UserDescriptionInput component and pass setImages function */}
      </Box>
      {/* Render GalleryView only when images are available */}
      {images.length > 0 && <GalleryView images={images} />}
      <Stack spacing={2}>
        <Pagination count={100} color="primary" />
      </Stack>
      <Footer /> {/* Render the Footer component */}
    </>
  );
};

export default HomePage;
