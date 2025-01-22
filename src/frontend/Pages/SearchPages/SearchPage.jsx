import React, { useState } from "react";
import {
  Box,
  Typography,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserDescriptionInput from "../../Components/Search-Components/Searchbars/UserInputDescription";
import SearchResults from "../../Components/Search-Components/SearchResults";
import Footer from "../../Components/Footer";
import SearchPageHeader from "../../Components/Headers/SearchPageHeader";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../backend/firebase";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";

const defaultTheme = createTheme();

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  const ViewToggle = ({ viewMode, onViewChange }) => (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      onChange={onViewChange}
      aria-label="view-mode"
    >
      <ToggleButton value="list" aria-label="list view">
        <ViewListIcon
          sx={{
            color: "white",
          }}
        />
      </ToggleButton>
      <ToggleButton value="grid" aria-label="grid view">
        <ViewModuleIcon
          sx={{
            color: "white",
          }}
        />
      </ToggleButton>
    </ToggleButtonGroup>
  );

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSearchStart = () => {
    setIsloading(true);
    setError(null);
  };

  const handleSearchResults = async (results) => {
    setSearchResults(results);
    setIsloading(false);
  };

  const handleSearchError = (ErrorMessage) => {
    setError(ErrorMessage);
    setIsloading(false);
  };

  const handleSaveSearch = async (searchQuery) => {
    try {
      const docRef = await addDoc(collection(db, "saved-searches"), {
        query: searchQuery,
        date: new Date().toISOString(),
      });
      setSavedSearches([
        ...savedSearches,
        { id: docRef.id, query: searchQuery, date: new Date().toISOString() },
      ]);
    } catch (error) {
      console.error("Error saving search", error);
    }
  };

  const handleSaveItem = async (item) => {
    try {
      await addDoc(collection(db, "saved-items"), item);
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  const handleDeleteSearch = async (id) => {
    try {
      await deleteDoc(doc(db, "saved-searches", id));
      setSavedSearches(savedSearches.filter((search) => search.id !== id));
    } catch (error) {
      console.error("Error deleting search:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
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
              textAlign: "center",
              mb: 2,
            }}
          >
            What clothes are we looking for today?
          </Typography>
          <UserDescriptionInput
            onSearchStart={handleSearchStart}
            onSaveSearch={handleSaveSearch}
            onSearchError={handleSearchError}
            onSearchResults={handleSearchResults}
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
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 2,
                }}
              >
                <ViewToggle
                  viewMode={viewMode}
                  onViewChange={handleViewChange}
                />
              </Box>

              <SearchResults
                results={searchResults}
                onSaveItem={handleSaveItem}
                viewMode={viewMode}
              />
            </>
          )}

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
        </Container>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SearchPage;
