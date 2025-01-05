import React, { useState, useCallback } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "axios";
import { debounce } from "lodash";
import SaveSearchButton from "../Buttons/SaveSearchButton";

function UserDescriptionInput({ onSearchStart, onSearchResults, onSearchError, onSaveSearch }) {
  const [description, setDescription] = useState("");

  const searchAsos = async (query) => {
    const options = {
      method: 'GET',
      url: 'https://asos2.p.rapidapi.com/products/v2/list',
      params: {
        store: 'US',
        offset: '0',
        categoryId: '4209',
        limit: '48',
        country: 'US',
        sort: 'freshness',
        q: query,
        currency: 'USD',
        sizeSchema: 'US',
        lang: 'en-US'
      },
      headers: {
        'x-rapidapi-key': '233692490cmshbe0b78ebe511b8fp11e5edjsn1fd2a3a5fc14',
        'x-rapidapi-host': 'asos2.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      return response.data.products;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleSubmit = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      alert("Please enter a description.");
      return;
    }
    onSearchStart();
    try {
      const results = await searchAsos(searchTerm);
      onSearchResults(results);
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

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={description}
        onChange={handleInputChange}
        sx={{ width: "90%", maxWidth: "500px", mr: 1 }}
      />
      <Button
        variant="contained"
        onClick={() => handleSubmit(description)}
        sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" }, mr: 1 }}
      >
        Search
      </Button>
      <SaveSearchButton onSave={handleSaveSearch} />
    </Box>
  );
}

export default UserDescriptionInput;
