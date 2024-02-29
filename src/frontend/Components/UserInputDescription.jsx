import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  ImageList,
  ImageListItem,
  Select,
  MenuItem,
} from "@mui/material";

function UserDescriptionInput() {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [sortBy, setSortBy] = useState("relevance"); // State for sorting
  const [filterBy, setFilterBy] = useState("all");

  // Fetch images based on description, sorting, and filtering
  const fetchImages = async () => {
    // Construct API URL with query parameters for sorting and filtering
    const url = `http://localhost:5000/search?description=${description}&sortBy=${sortBy}&filterBy=${filterBy}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images", error);
      // Display error message to the user
      // Optionally, retry the request or provide a way for the user to retry
    }
  };

  // useEffect to fetch images whenever description, sorting, or filtering changes
  useEffect(() => {
    fetchImages();
  }, [description, sortBy, filterBy]);

  // Event Handler for description input change
  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Event Handler for filtering selection change
  const handleFilterChange = (event) => {
    setFilterBy(event.target.value);
  };

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
        aria-label="Search input"
      />
      {/* <Select
        value={sortBy}
        onChange={handleSortChange}
        variant="filled"
        sx={{
          backgroundColor: "white",
          marginRight: "10px",
        }}
      >
        <MenuItem value="relevance">Relevance</MenuItem>
        <MenuItem value="price">Price</MenuItem>
        <MenuItem value="rating">Rating</MenuItem>
      </Select>
      <Select
        value={filterBy}
        onChange={handleFilterChange}
        variant="filled"
        sx={{ backgroundColor: "white", marginRight: "10px" }}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="in-stock">In Stock</MenuItem>
        <MenuItem value="sale">On Sale</MenuItem>
      </Select> */}
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
        aria-label="Search button"
        tabIndex="O" // Ensure the button is focusable
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
