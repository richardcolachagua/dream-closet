import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { debounce, } from "lodash";

const useRecentSearches = (maxSearches = 5) => {
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const loadedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(loadedSearches);
  }, []);

  const addRecentSearch = useCallback((search) => {
    const updatedSearches = [search, ...recentSearches.filter(s => s !== search)].slice(0, maxSearches);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  }, [recentSearches, maxSearches]);
  return [recentSearches, addRecentSearch];
}

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
}) {
  const [description, setDescription] = useState("");
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef(null);
  const [recentSearches, addRecentSearch] = useRecentSearches();

  const handleSubmit = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      alert("Please enter a description.");
      return;
    }
    onSearchStart();
    try {
      const q = query(
        collection(db, "products"),
        where("description", ">=", searchTerm.toLowerCase()),
        where("description", "<", searchTerm.toLowerCase() + "\uf8ff"), limit(20)
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onSearchResults(results);
      addRecentSearch(searchTerm);
    } catch (error) {
      console.error("Error submitting description:", error);
      onSearchError("Error submitting description");
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      handleSubmit(value);
    }, 300),
    []
  );

  const handleInputChange = (event) => {
    setDescription(event.target.value);
    debouncedSearch(event.target.value);
  };

  const handleSaveSearch = () => {
    onSaveSearch(description);
  };

  const handleRecentSearchClick = (search) => {
    setDescription(search);
    handleSubmit(search);
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
          justifyContent: "center",
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
          onClick={() => handleSubmit(description)}
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
