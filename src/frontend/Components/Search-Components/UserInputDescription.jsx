import React, { useEffect, useState, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import SaveSearchButton from "./SaveSearchButton";
import axios from "axios";

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
}) {
  const [description, setDescription] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef(null);

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
      const response = await axios.get(
        `/api/search?query=${encodeURIComponent(description)}`
      );
      onSearchResults(response.data);

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

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && showRecentSearches) {
      event.preventDefault();
      const firstItem = document.querySelector(".recent-search-item");
      if (firstItem) firstItem.focus();
    }
  };

  return (
    <ClickAwayListener onClickAway={() => setShowRecentSearches(false)}>
      <Box
        sx={{
          position: "relative",
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
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          sx={{
            width: "90%",
            maxWidth: "500px",
            backgroundColor: "white",
            border: "10px",
            borderBottom: "2px solid #ccc",
            borderRadius: "10px",
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
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

        <SaveSearchButton
          onSave={handleSaveSearch}
          disabled={!description.trim()}
        />
        {showRecentSearches && recentSearches.length > 0 && (
          <List
            sx={{
              position: "absolute",
              top: "100%",
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
                className="recent-search-item"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRecentSearchClick(search);
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextItem = e.target.nextElementSibling;
                    if (nextItem) nextItem.focus();
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevItem = e.target.previousElementSibling;
                    if (prevItem) prevItem.focus();
                    else inputRef.current.focus();
                  }
                }}
              >
                <ListItemText primary={search} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default UserDescriptionInput;
