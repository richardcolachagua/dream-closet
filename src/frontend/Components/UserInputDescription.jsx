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
import axios from "axios";

function UserDescriptionInput() {
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [filterBy, setFilterBy] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch images based on description, sorting, and filtering
  const fetchImages = async () => {
    setLoading(true);
    // Construct API URL with query parameters for sorting and filtering
    const url = `http://localhost:5000/images?description=${description}&sortBy=${sortBy}&filterBy=${filterBy}&page=${currentPage}&itemsPerPage=${itemsPerPage}`;

    try {
      const response = await axios.get(url);
      setImages(response.data);
    } catch (error) {
      console.error("Error fetching images", error);
      // Handle error state or dipslay error message to the user
    } finally {
      setLoading(false);
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
      {/* Select dropdown for sorting */}
      <Select
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
      {/* Select dropdown for filtering */}

      {/* Search button to trigger image fetching */}
      <Button
        variant="contained"
        color="primary"
        onClick={fetchImages}
        disabled={!description.trim() || loading} // Disable button when input is empty or loading
        sx={{
          bgcolor: "primary.main",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
        aria-label="Search button"
        tabIndex="0" // Ensure the button is focusable
      >
        Search
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          setDescription("");
          setImages([]);
        }}
      >
        Clear
      </Button>
      {/* Display fetched images in an ImageList */}
      <ImageList cols={3}>
        {images.map((item, index) => (
          <ImageListItem key={index}>
            <img src={item.src} alt={item.alt} />
          </ImageListItem>
        ))}
      </ImageList>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {/* Display error message */}
    </Box>
  );
}

export default UserDescriptionInput;
