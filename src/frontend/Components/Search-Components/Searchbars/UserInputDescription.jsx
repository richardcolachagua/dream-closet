import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
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

  const searchAsos = async (query) => {
    try {
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
          "x-rapidapi-key":
            "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
          "x-rapidapi-host": "asos2.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      return response.data.products;
    } catch (error) {
      console.error("ASOS API error:", error);
      throw error;
    }
  };

  const searchAdditionalAPIs = async (query) => {
    try {
      if (!query || query.length < 3) {
        return { amazonResults: [], depopResults: [] };
      }

      const realTimeOptions = {
        method: "GET",
        url: "https://real-time-product-search.p.rapidapi.com/store-reviews",
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
      };

      const [realTimeResponse, depopResponse] = await Promise.allSettled([
        axios.request(realTimeOptions),
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
          },
          timeout: 5000,
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

  const handleSubmit = async () => {
    if (description.trim() === "") {
      onSearchError("Please enter a description.");
      return;
    }
    onSearchStart();
    setIsLoading(true);

    try {
      const [asosResults, additionalResults] = await Promise.all([
        searchAsos(description),
        searchAdditionalAPIs(description),
      ]);

      const combinedResults = [
        ...(asosResults || []).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price?.current?.text || "Price unavailable",
          imageUrl: product.imageUrl ? `https://${product.imageUrl}` : "",
          productUrl: product.url ? `https://www.asos.com/${product.url}` : "",
          source: "ASOS",
        })),
        ...(additionalResults.amazonResults || []).map((review) => ({
          id: review.id,
          name: review.title,
          price: "N/A",
          imageUrl: review.image_url || "",
          productUrl: review.product_url || "",
          source: "Amazon",
        })),
        ...(additionalResults.depopResults || []).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url,
          productUrl: product.url,
          source: "Depop",
        })),
      ];

      onSearchResults(combinedResults);
    } catch (error) {
      console.error("Search error:", error);
      onSearchError(
        error.response?.status === 429
          ? "Too many requests. Please wait a moment."
          : "Error fetching results. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSaveSearch = async () => {
    if (description.trim() === "") {
      onSearchError("Cannot save empty search");
      return;
    }
    try {
      await addDoc(collection(db, "saved-searches"), {
        query: description,
        timestamp: new Date(),
      });
      console.log("Search saved successfully");
      onSaveSearch(description);
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
          onClick={handleSubmit}
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
          {isLoading ? "Searching..." : "Search"}
        </Button>
        <SaveSearchButton
          sx={{
            flex: 1,
          }}
          onSave={() => handleSaveSearch(description)}
        />
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
