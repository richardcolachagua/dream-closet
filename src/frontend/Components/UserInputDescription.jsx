import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  ImageList,
  ImageListItem,
} from "@mui/material";

function UserDescriptionInput() {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/search?description=${description}`
      );
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [description]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "& > :not(style)": { m: 1 },
      }}
    >
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={description}
        onChange={handleInputChange}
        sx={{ width: "100%", maxWidth: "500px", backgroundColor: "grey" }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={fetchImages}
        sx={{
          bgcolor: "primary.main",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        Search
      </Button>
      <ImageList cols={3}>
        {images.map((item, index) => (
          <ImageListItem key={item.src || index}>
            <img src={item.src || item} alt={item.alt || "Clothing item"} />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

export default UserDescriptionInput;
