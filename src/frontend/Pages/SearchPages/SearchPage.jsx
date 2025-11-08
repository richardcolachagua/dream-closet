import { useEffect, useState } from "react";
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
import { addDoc, collection } from "firebase/firestore";
import { db, auth } from "../../../backend/firebase";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useLocation } from "react-router-dom";
import { fetchCombinedResults } from "../../Components/Search-Components/utils/fetchCombinedResults";

const defaultTheme = createTheme();

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState("");

  const location = useLocation();

  const runSearch = async (query) => {
    setIsloading(true);
    try {
      const results = await fetchCombinedResults(query);
      handleSearchResults(results);
    } catch (error) {
      setIsloading(false);
      setError("Failed to fetch search results.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query) {
      setSearchInputValue(query);
      handleSearchStart();
      runSearch(query);
    }
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSearchStart = () => {
    setIsloading(true);
    setError(null);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsloading(false);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsloading(false);
  };

  const handleSaveSearch = async (searchQuery) => {
    try {
      await addDoc(collection(db, "saved-searches"), {
        query: searchQuery,
        userId: currentUser?.uid,
        date: new Date().toISOString(),
      });
      setSuccessMessage("Search saved successfully!");
    } catch (error) {
      setError("Error saving search.");
      console.error("Error saving search", error);
    }
  };

  const handleSaveItem = async (item) => {
    try {
      await addDoc(collection(db, "saved-items"), {
        ...item,
        userId: currentUser.uid,
      });
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflowX: "hidden",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <SearchPageHeader />
        <CssBaseline />
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Container
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              px: 2,
              py: 4,
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
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
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
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewChange}
                    aria-label="view-mode"
                  >
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon sx={{ color: "white" }} />
                    </ToggleButton>
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon sx={{ color: "white" }} />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <SearchResults
                  results={searchResults}
                  onSaveItem={handleSaveItem}
                  viewMode={viewMode}
                  userId={currentUser?.uid}
                />
              </>
            )}
            <Snackbar
              open={!!successMessage}
              autoHideDuration={6000}
              onClose={() => setSuccessMessage(null)}
            >
              <Alert
                onClose={() => setSuccessMessage(null)}
                severity="success"
                sx={{ width: "100%" }}
              >
                {successMessage}
              </Alert>
            </Snackbar>
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
        </Box>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SearchPage;
