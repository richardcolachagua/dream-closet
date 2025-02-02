import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  ClickAwayListener,
} from "@mui/material";
import axios from "axios";

const fetchProducts = async (query) => {
  const results = [];

  // ASOS API
  const asosOptions = {
    method: "GET",
    url: "https://asos2.p.rapidapi.com/products/v2/list",
    params: {
      store: "US",
      offset: "0",
      categoryId: "4209",
      country: "US",
      sort: "freshness",
      currency: "USD",
      sizeSchema: "US",
      limit: "48",
      lang: "en-US",
      q: query,
    },
    headers: {
      "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
      "x-rapidapi-host": "asos2.p.rapidapi.com",
    },
  };

  // Real-time Product Search API
  const realTimeOptions = {
    method: "GET",
    url: "https://real-time-product-search.p.rapidapi.com/store-reviews",
    params: {
      store_domain: "amazon.com",
      limit: "10",
      rating: "ALL",
      sort_by: "MOST_HELPFUL",
      time_frame: "ALL",
      country: "us",
      language: "en",
    },
    headers: {
      "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
      "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
    },
  };

  // Depop API
  const depopOptions = {
    method: "GET",
    url: "https://depop3.p.rapidapi.com/search-user-id",
    params: {
      country: "US",
      boosted: "false",
      user_id: "47722706",
    },
    headers: {
      "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
      "x-rapidapi-host": "depop3.p.rapidapi.com",
      Accept: "application/json",
    },
  };

  try {
    const [asosResponse, realTimeResponse, depopResponse] = await Promise.all([
      axios.request(asosOptions),
      axios.request(realTimeOptions),
      axios.request(depopOptions),
    ]);

    // Process ASOS results
    results.push(
      ...asosResponse.data.products.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price.current.text,
        imageUrl: `https://${product.imageUrl}`,
        productUrl: `https://www.asos.com/${product.url}`,
        source: "ASOS",
      }))
    );
    // Process Real-time Product Search results
    results.push(
      ...realTimeResponse.data.reviews.map((review) => ({
        id: review.id,
        name: review.title,
        price: "N/A",
        imageUrl: review.image_url || "",
        productUrl: review.product_url || "",
        source: "Amazon",
      }))
    );

    // Process Depop results
    if (depopResponse.data.products) {
      results.push(
        ...depopResponse.data.products.map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url,
          productUrl: product.url,
          source: "Depop",
        }))
      );
    }

    return results;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

function FreeUserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
}) {
  const [description, setDescription] = useState("");
  const [recentSearches, setRecentSearches] = useState(() => {
    return JSON.parse(localStorage.getItem("recentSearches")) || [];
  });
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const inputRef = useRef(null);

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
      const results = await fetchProducts(description);
      onSearchResults(results);

      const updatedSearches = [
        description,
        ...recentSearches.filter((s) => s !== description),
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Error submitting description:", error);
      onSearchError("Error submitting description");
    }
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

export default FreeUserDescriptionInput;
