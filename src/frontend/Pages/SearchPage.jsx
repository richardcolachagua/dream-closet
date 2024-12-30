import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from 'react-query';
import UserDescriptionInput from "../Components/Search-Components/UserInputDescription";
import SearchResults from "../Components/Search-Components/SearchResults";
import Footer from "../Components/Footer";
import SearchPageHeader from "../Components/Headers/SearchPageHeader";
import SavedSearches from "../Components/Search-Components/SavedSearches";
import {
  Box,
  Typography,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";

const defaultTheme = createTheme();

const useSearchResults = (query, page = 1) => {
  return useQuery(
    ['searchResults', query, page],
    async () => {
      const response = await axios.get(`/api/search?q=${query}&page=${page}`);
      return response.data;
    },
    {
      enabled: !!query,
    }
  )
}

const useSaveSearch = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (search) => axios.post("/api/save-search", { query: search}), {
      onSuccess: () => {
        queryClient.invalidateQueries('savedSearches')
      }
    }
  )
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const {data: searchResults, isLoading, error} = useSearchResults(searchQuery, page);
  const saveSearchMutation = useSaveSearch();
  const [savedSearches, setSavedSearches] = useState([]);

  const handleSearchStart = (query) => {
    setSearchQuery(query);
    setPage(1);
  }

  const handleSaveSearch = async (search) => {
    try {
   await saveSearchMutation.mutateAsync(search);
   setSavedSearches([
    ...setSavedSearches,
    { id: Date.now().toString(), query: search }
   ]);
    } catch (error) {
      console.error("Error saving search", error)
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      await axios.delete(`/api/delete-search/${id}`);
      setSavedSearches(savedSearches.filter((search) => search.id !== id));
    } catch (error) {
      console.error("Error deleting search:", error)
    }
  }; 

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease",
        minHeight: "100vh",
        backgroundColor: "red",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <SearchPageHeader />
        <CssBaseline />
        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "30px",
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
          <Box sx={{ marginTop: 2, padding: "10px" }}>
            <UserDescriptionInput
              onSearchStart={handleSearchStart}
              onSaveSearch={handleSaveSearch}
            />
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
            {!isLoading && searchResults && searchResults.length > 0 && (
              <SearchResults results={searchResults} />
            )}
            <SavedSearches
              savedSearches={savedSearches}
              onDeleteSearch={handleDeleteSearch}
            />
            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => {}}
            >
              <Alert
                onClose={() => {}}
                severity="error"
                sx={{ width: "100%" }}
              >
                {error && error.message}
              </Alert>
            </Snackbar>
          </Box>
        </Container>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SearchPage;
