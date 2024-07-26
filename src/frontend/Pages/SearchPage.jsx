import React, { useState } from "react";
import UserDescriptionInput from "../Components/Search-Components/UserInputDescription";
import SearchResults from "../Components/Search-Components/SearchResults";
import Footer from "../Components/Footer";
import SearchPageHeader from "../Components/Headers/SearchPageHeader";
import Searches from "../Components/Search-Components/SavedSearches";
import {
  Box,
  Typography,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";

const SearchPage = () => {
  const defaultTheme = createTheme();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (ErrorMessage) => {
    setError(ErrorMessage);
    setIsLoading(false);
  };

  const handleSaveSearch = async (search) => {
    try {
      await axios.post("/api/save-search", { query: search });
      setSavedSearches([
        ...savedSearches,
        { id: Date.now().toString(), query: search },
      ]);
    } catch (error) {
      console.error("Error saving search:", error);
      setError("Error saving search");
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      await axios.delete(`/api/delete-search/${id}`);
      setSavedSearches(savedSearches.filter((search) => search.id === id));
    } catch (error) {
      console.error("Error deleting search:", error);
      setError("Error deleting search");
    }
  };

  return (
    <>
      <Box
        sx={{
          transition: "background-color 0.3s ease",
          minHeight: "100vh",
          backgroundColor: "black",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <ThemeProvider theme={defaultTheme}>
          <SearchPageHeader />
          <CssBaseline />
          <Box
            sx={{
              padding: "50px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            >
              What are we looking for today?
            </Typography>
            <UserDescriptionInput
              onSearchStart={handleSearchStart}
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
              onSaveSearch={handleSaveSearch}
            />
          </Box>
          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 4,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {!isLoading && searchResults.length > 0 && (
            <SearchResults results={searchResults} />
          )}
          <Searches
            savedSearches={savedSearches}
            onDeleteSearch={handleDeleteSearch}
          />{" "}
        </ThemeProvider>
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      </Box>
      <Footer />
    </>
  );
};

export default SearchPage;
