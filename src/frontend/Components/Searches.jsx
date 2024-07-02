import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const Searches = () => {
  const [savedSearches, setSavedSearches] = useState();
  const [savedItems, setSavedItems] = useState();

  useEffect(() => {
    //Fetch saved searches and items from your backend
    fetchSavedSearches();
    fetchSavedItems();
  }, []);

  const fetchSavedSearches = async () => {
    // Implement API call to fetch saved searches
    // setSavedSearches(result);
    try {
      const response = await axios.get("/api/saved-searches");
      setSavedSearches(response.data);
    } catch (error) {
      console.error("Error fetching saved searches", error);
    }
  };

  const fetchSavedItems = async () => {
    // Implement API call to fetch saved items
    // setSavedItems(result);
    try {
      const response = await axios.get("/api/saved-items");
      setSavedItems(response.data);
    } catch (error) {
      console.error("Error fetching saved items", error);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    // Implement delete functionality
    try {
      await axios.delete(`/api/saved-searches/${searchId}`);
      setSavedSearches(
        savedSearches.filter((search) => search.id !== searchId)
      );
    } catch (error) {
      console.error("Error deleting search", error);
    }
  };
  const handleDeleteItem = async (itemId) => {
    // Implement delete functionality
    try {
      await axios.delete(`/api/saved/item/${itemId}`);
      setSavedItems(savedItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting saved item", error);
    }
  };

  return (
    <Container>
      <Typography
        variant="h2"
        sx={{ mb: 3, fontWeight: "bold", color: "white" }}
      >
        Your Saved Searches
      </Typography>
      <Box mb={4}>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "bold", color: "white" }}
        >
          Saved Items
        </Typography>
        <Grid container spacing={2}>
          {savedItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2">{item.description}</Typography>
                  <IconButton onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "bold", color: "white" }}
        >
          Saved Searches
        </Typography>
        <Grid container spacing={2}>
          {savedSearches.map((search) => (
            <Grid item xs={12} sm={6} md={4} key={search.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{search.query}</Typography>
                  <Typography variant="body2">
                    {" "}
                    Date: {new Date(search.date).toLocaleDateString()}{" "}
                  </Typography>
                  <IconButton onClick={() => handleDeleteSearch(search.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Searches;
