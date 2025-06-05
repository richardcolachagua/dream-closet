import { useState } from "react";
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
    try {
      const response = await axios.request(options);
      return response.data.products;
    } catch (error) {
      console.error("ASOS API error:", error);
      throw error;
    }
  };

  const searchRealTimeProducts = async (query) => {
    const options = {
      method: "GET",
      url: "https://real-time-product-search.p.rapidapi.com/search",
      params: {
        q: query,
        country: "uk",
        language: "en",
        page: "1",
        limit: "10",
        sort_by: "BEST_MATCH",
        product_condition: "ANY",
        min_rating: "ANY",
      },
      headers: {
        "x-rapidapi-key": "233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14",
        "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log("Real-Time Product Search Raw Response:", response.data);
      return response.data?.data?.products || [];
    } catch (error) {
      console.error("Real-Time Product Search API Error:", error);
      throw error;
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
      const [asosResults, realTimeResults] = await Promise.all([
        searchAsos(description),
        searchRealTimeProducts(description),
      ]);
      console.log("ASOS results:", asosResults);
      console.log("Real-Time Product Search results:", realTimeResults);

      const combinedResults = [
        ...(Array.isArray(asosResults) ? asosResults : []).map((product) => ({
          id: product.id,
          name: product.name,
          price: product.price?.current?.text || "Price unavailable",
          imageUrl: product.imageUrl ? `https://${product.imageUrl}` : "",
          productUrl: product.url ? `https://www.asos.com/${product.url}` : "",
          source: "ASOS",
        })),
        ...(Array.isArray(realTimeResults) ? realTimeResults : []).map(
          (product) => ({
            id: product.product_id,
            name: product.product_title,
            price: product.offer?.price || "Price unavailable",
            imageUrl: product.product_photos?.[0] || "",
            productUrl: product.offer?.offer_page_url || "",
            source: product.offer?.store_name || "Unknown",
          })
        ),
      ];

      console.log("Combined Results:", combinedResults);

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
        width: "50%",
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
          disabled={isLoading}
        />
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
