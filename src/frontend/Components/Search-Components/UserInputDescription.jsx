import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
}) {
  const [description, setDescription] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  // const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    //Load recent searches from localstorage or api
    const loadedSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(loadedSearches);
  }, []);

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async () => {
    if (description.trim() === "") {
      alert("Please enter a description.");
      return;
    }
    onSearchStart();
    try {
      // Replace '/api/submit-description' with your actual API endpoint
      const response = await fetch("/api/submit-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      onSearchResults(data);

      //Add to recent searches
      const updatedSearches = [description, ...recentSearches.slice(0, 4)];
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Error submitting description:", error);
      onSearchError("Error submitting description");
    }
  };

  const handleSaveSearch = () => {
    onSaveSearch(description);
  };

  const handleRecentSearchClick = (search) => {
    setDescription(search);
    handleSubmit();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        "& > :not(style)": { m: 1 },
      }}
    >
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={description}
        onChange={handleInputChange}
        onFocus={() => setShowRecentSearches(true)}
        onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
        sx={{
          width: "90%",
          maxWidth: "500px",
          backgroundColor: "white",
          border: "10px",
          borderBottom: "2px solid #ccc",
          borderRadius: "10px",
        }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{
          bgcolor: "primary.main",
          "&:hover": {
            bgcolor: "primary.dark",
          },
        }}
      >
        Search
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleSaveSearch}
        sx={{ ml: 2 }}
      >
        Save Search
      </Button>
      {showRecentSearches && recentSearches.length > 0 && (
        <List
          sx={{
            position: "absolute",
            width: "90%",
            maxWidth: "500px",
            bgcolor: "background.paper",
            boxShadow: 3,
            zIndex: 1,
          }}
        >
          {recentSearches.map((search, index) => (
            <ListItem
              key={index}
              button
              onClick={() => handleRecentSearchClick(search)}
            >
              <ListItemText primary={search} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default UserDescriptionInput;
