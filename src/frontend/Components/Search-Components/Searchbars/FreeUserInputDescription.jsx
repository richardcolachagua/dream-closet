import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  List,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";

function FreeUserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSearchSubmit,
  onOpenFilters,
  activeFilterCount = 0,
}) {
  const [description, setDescription] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches")) || [];
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const saveRecentSearch = (searchValue) => {
    const updatedSearches = [
      searchValue,
      ...recentSearches.filter((s) => s !== searchValue),
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const handleSubmit = async (searchValue = description) => {
    if (searchValue.trim() === "") {
      onSearchError("Please enter a description.");
      return;
    }

    onSearchStart();
    setIsLoading(true);

    try {
      const results = await onSearchSubmit(searchValue);
      onSearchResults(results);
      setDescription(searchValue);
      saveRecentSearch(searchValue);
      setShowRecentSearches(false);
    } catch (error) {
      console.error("Error submitting description:", error);
      onSearchError(
        error?.response?.status === 429
          ? "Too many requests. Please wait a moment."
          : "Error submitting description",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentSearchClick = (search) => {
    handleSubmit(search);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
      return;
    }

    if (event.key === "ArrowDown" && showRecentSearches) {
      event.preventDefault();
      const firstItem = document.querySelector(".recent-search-item");
      if (firstItem) firstItem.focus();
    }
  };

  const filterButtonLabel =
    activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters";

  return (
    <ClickAwayListener onClickAway={() => setShowRecentSearches(false)}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          px: 2,
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            gap: 1.5,
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
              width: "100%",
              maxWidth: "500px",
              backgroundColor: "white",
              borderRadius: "10px",
            }}
          />

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {onOpenFilters && (
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={onOpenFilters}
                sx={{
                  borderColor: "turquoise",
                  color: "turquoise",
                  fontWeight: "bold",
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {filterButtonLabel}
              </Button>
            )}

            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={isLoading}
              sx={{
                bgcolor: "turquoise",
                "&:hover": {
                  bgcolor: "darkturquoise",
                },
                color: "black",
                fontWeight: "bold",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </Box>
        </Box>

        {showRecentSearches && recentSearches.length > 0 && (
          <List
            sx={{
              width: "100%",
              maxWidth: "500px",
              bgcolor: "background.paper",
              boxShadow: 3,
              zIndex: 10,
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            {recentSearches.map((search, index) => (
              <ListItemButton
                key={index}
                onClick={() => handleRecentSearchClick(search)}
                className="recent-search-item"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRecentSearchClick(search);

                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextItem = e.currentTarget.nextElementSibling;
                    if (nextItem) nextItem.focus();
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevItem = e.currentTarget.previousElementSibling;
                    if (prevItem) prevItem.focus();
                    else inputRef.current?.focus();
                  }
                }}
              >
                <ListItemText primary={search} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default FreeUserDescriptionInput;
