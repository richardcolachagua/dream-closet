import React, { useState, useCallback } from "react";
import { TextField, Button, Box } from "@mui/material";
import { debounce } from "lodash";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../../backend/firebase";
import axios from "axios";
import SaveSearchButton from "../Buttons/SaveSearchButton";

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

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
}) {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      onSearchError("Please enter a description.");
      return;
    }

    onSearchStart();
    setIsLoading(true);

    try {
      const results = await fetchProducts(searchTerm);
      onSearchResults(results);
    } catch (error) {
      console.error("Error submitting description:", error);
      onSearchError("Error submitting description");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      handleSubmit(value);
    }, 300),
    [handleSubmit]
  );

  const handleInputChange = (event) => {
    const value = event.target.value;
    setDescription(value);
    debouncedSearch(value);
  };

  const handleSaveSearch = async () => {
    try {
      await addDoc(collection(db, "saved-searches"), {
        query: description,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving search", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={description}
        onChange={handleInputChange}
        sx={{
          width: "90%",
          maxWidth: "500px",
          mr: 2,
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      />
      <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
        <Button
          variant="contained"
          onClick={() => handleSubmit(description)}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            mr: 2,
            width: "100px",
            backgroundColor: "turquoise",
            color: "black",
            fontWeight: "bold",
            fontSize: "15px",
          }}
        >
          Search
        </Button>
        <SaveSearchButton
          sx={{
            flex: 1,
          }}
          onSave={handleSaveSearch}
        />
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
