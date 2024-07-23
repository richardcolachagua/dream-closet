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

  const handleSaveSearch = (search) => {
    setSavedSearches([...savedSearches, search]);
  };

  const handleDeleteSearch = (index) => {
    const updatedSearches = savedSearches.filter((_, i) => i !== index);
    setSavedSearches(updatedSearches);
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
        {" "}
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
              Personalized Recommendations
            </Typography>
          </Box>
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
        </Snackbar>{" "}
      </Box>
      <Footer />
    </>
  );
};

export default SearchPage;
