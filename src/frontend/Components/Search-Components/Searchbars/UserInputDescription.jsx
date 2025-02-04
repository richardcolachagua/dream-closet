import React, { useState, useCallback } from "react";
import { TextField, Button, Box } from "@mui/material";
import { debounce, last } from "lodash";
import { addDoc, collection, query } from "firebase/firestore";
import { db } from "../../../../backend/firebase";
import axios from "axios";
import SaveSearchButton from "../Buttons/SaveSearchButton";

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
}) {
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);

  const searchAsos = async (query) => {
    // ASOS API
    const options = {
      method: "GET",
      url: "https://asos2.p.rapidapi.com/products/v2/list",
      params: {
        store: "US",
        offset: "0",
        categoryId: "4209",
        limit: "48",
        country: "US",
        sort: "freshness",
        q: query,
        currency: "USD",
        sizeSchema: "US",
        lang: "en-US",
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

    try {
      const now = Date.now();
      const timeSinceLast = now - lastRequestTime;

      // Enforce rate limit (1 request per 500ms)
      if (timeSinceLast < 500) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 - timeSinceLast)
        );
      }
      const response = await axios.request(options);
      setLastRequestTime(Date.now());
      return response.data.products;
    } catch (error) {
      console.error("ASOS API error:", error);
      throw error;
    }
  };

  const searchAddtionalAPIs = async (query) => {
    try {
      if (!query || query.length < 3) {
        return {
          amazonResults: [],
          depopResults: [],
        };
      }
      const [realTimeResponse, depopResponse] = await Promise.allSettled([
        axios.get(
          "https://real-time-product-search.p.rapidapi.com/store-reviews",
          {
            params: {
              store_domain: "amazon.com",
              limit: "10",
              q: query,
              country: "us",
            },
            headers: {
              "x-rapidapi-key":
                "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
              "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
            },
          }
        ),
        axios.get("https://depop3.p.rapidapi.com/search", {
          params: {
            query: encodeURIComponent(query),
            country: "US",
            limit: "10",
          },
          headers: {
            "x-rapidapi-key":
              "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
            "x-rapidapi-host": "depop3.p.rapidapi.com",
            timeout: 5000,
          },
        }),
      ]);
      return {
        amazonResults:
          realTimeResponse.status === "fulfilled"
            ? realTimeResponse.value.data?.reviews || []
            : [],
        depopResults:
          depopResponse.status === "fulfilled"
            ? depopResponse.value.data?.products || []
            : [],
      };
    } catch (error) {
      console.error("Additional API Error:", error);
      return { amazonResults: [], depopResults: [] };
    }
  };

  const handleSubmit = useCallback(
    async (searchTerm) => {
      if (searchTerm.trim() === "") {
        onSearchError("Please enter a description.");
        return;
      }
      onSearchStart();
      setIsLoading(true);

      try {
        const [asosResults, additionalResults] = await Promise.all([
          searchAsos(searchTerm),
          searchAddtionalAPIs(searchTerm),
        ]);

        const combinedResults = [
          ...asosResults.map((product) => ({
            ...product,
            price: product.price.current.text,
            imageUrl: `https://${product.imageUrl}`,
            productUrl: `https://www.asos.com/${product.url}`,
          })),
          ...additionalResults.amazonResults.map((review) => ({
            id: review.id,
            name: review.title,
            price: "N/A",
            imageUrl: review.image_url || "",
            productUrl: review.product_url || "",
            source: "Amazon",
          })),
          ...additionalResults.depopResults.map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url,
            productUrl: product.url,
            source: "Depop",
          })),
        ];
        onSearchResults(combinedResults);
        onSaveSearch(searchTerm);
      } catch (error) {
        onSearchError(
          error.response?.status === 429
            ? "Too many requests. Please wait a moment."
            : "Error fetching results. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onSearchError, onSearchResults, onSaveSearch, onSearchStart]
  );
  const debouncedSearch = useCallback(debounce(handleSubmit, 500), [
    handleSubmit,
  ]);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setDescription(value);
    if (value.trim().length > 2) {
      debouncedSearch(value);
    }
  };

  const handleSaveSearch = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      onSearchError("Cannot save empty search");
      return;
    }
    try {
      await addDoc(collection(db, "saved-search"), {
        query: searchTerm,
        timeStamp: new Date(),
      });
      console.log("Search saved successfully");
    } catch (error) {
      console.error("Error saving search", error);
      onSearchError("Failed to save search. Please try again");
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
          disabled={isLoading}
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
          onSave={() => handleSaveSearch(description)}
          disabled={isLoading || description.trim().length === 0}
        />
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
