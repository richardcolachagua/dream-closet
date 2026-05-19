import { useEffect, useState, useCallback } from "react";
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
  FormControlLabel,
  Switch,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import UserDescriptionInput from "../../Components/Search-Components/Searchbars/UserInputDescription";
import SearchResults from "../../Components/Search-Components/SearchResults";
import Footer from "../../Components/Footer";
import SearchPageHeader from "../../Components/Headers/SearchPageHeader";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../backend/firebase";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useLocation } from "react-router-dom";
import { fetchCombinedResults } from "../../Components/Search-Components/utils/fetchCombinedResults";
import FilterDrawer from "../../Components/Search-Components/Filters/FilterDrawer";
import {
  createDefaultFilters,
  toggleFilterValue,
  setPriceFilterValue,
  clearFilterGroup,
  clearAllFilters,
  removeFilterValue,
  getActiveFilterCount,
} from "../../Components/Search-Components/utils/filterHelpers";

const defaultTheme = createTheme();

const SearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [filters, setFilters] = useState(createDefaultFilters());
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [onboardingGender, setOnboardingGender] = useState("");
  const [showAllGenders, setShowAllGenders] = useState(false);

  const location = useLocation();

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSearchStart = () => {
    setIsloading(true);
    setError(null);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsloading(false);
  };

  const handleSaveSearch = async (searchQuery) => {
    if (!currentUser) {
      setError("You must be logged in to save searches.");
      return;
    }

    try {
      await addDoc(collection(db, "saved-searches"), {
        query: searchQuery,
        filters,
        userId: currentUser.uid,
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

  const handleSearchResults = useCallback((results) => {
    setSearchResults(results);
    setIsloading(false);
  }, []);

  const runSearch = useCallback(
    async (
      query,
      activeFilters = filters,
      activeGender = showAllGenders ? "" : onboardingGender,
    ) => {
      setIsloading(true);

      try {
        const results = await fetchCombinedResults({
          query,
          filters: activeFilters,
          onboardingGender: activeGender,
        });
        handleSearchResults(results);
        return results;
      } catch (error) {
        setIsloading(false);
        setError("Failed to fetch search results.");
        throw error;
      }
    },
    [filters, onboardingGender, showAllGenders, handleSearchResults],
  );

  const handleToggleFilter = (key, value) => {
    setFilters((prev) => toggleFilterValue(prev, key, value));
  };

  const handlePriceChange = (key, value) => {
    setFilters((prev) => setPriceFilterValue(prev, key, value));
  };

  const handleClearGroup = (key) => {
    setFilters((prev) => clearFilterGroup(prev, key));
  };

  const handleClearAll = () => {
    const clearedFilters = clearAllFilters();
    setFilters(clearedFilters);

    if (searchInputValue.trim()) {
      runSearch(searchInputValue, clearedFilters);
    }
  };

  const handleRemoveFilter = (key, value) => {
    setFilters((prev) => {
      const updatedFilters = removeFilterValue(prev, key, value);

      if (searchInputValue.trim()) {
        runSearch(searchInputValue, updatedFilters);
      }

      return updatedFilters;
    });
  };

  const handleApplyFilters = async () => {
    if (!searchInputValue.trim()) {
      setIsFilterDrawerOpen(false);
      return;
    }

    await runSearch(searchInputValue, filters);
    setIsFilterDrawerOpen(false);
  };

  // Restore query from URL on first load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query");

    if (query) {
      setSearchInputValue(query);
      handleSearchStart();
      runSearch(query, filters);
    }
  }, [location.search, runSearch]);

  // Load onboarding gender when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (!user) {
        setOnboardingGender("");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setOnboardingGender(data?.onboarding?.gender || "");
        }
      } catch (error) {
        console.error("Error loading onboarding gender", error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Rerun search when gender toggle or onboarding gender changes
  useEffect(() => {
    if (!searchInputValue.trim()) return;

    runSearch(
      searchInputValue,
      filters,
      showAllGenders ? "" : onboardingGender,
    );
  }, [showAllGenders, onboardingGender, searchInputValue, filters, runSearch]);

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
              onSearchSubmit={(query) => {
                setSearchInputValue(query);
                return runSearch(query, filters);
              }}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              activeFilterCount={getActiveFilterCount(filters)}
            />

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                mt: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                sx={{
                  color: "white",
                  ml: 0,
                }}
                control={
                  <Switch
                    checked={showAllGenders}
                    onChange={(e) => setShowAllGenders(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show all genders"
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

            {!isLoading && (
              <>
                {searchResults && searchResults.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      width: "100%",
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
                )}

                <SearchResults
                  results={searchResults}
                  isLoading={isLoading}
                  hasSearched={searchInputValue.trim().length > 0}
                  query={searchInputValue}
                  suggestions={[
                    "Try a broader search like 'black dress' or 'oversized blazer'",
                    "Remove one or two filters",
                    "Search by occasion, color, or item type",
                  ]}
                  onSaveItem={handleSaveItem}
                  viewMode={viewMode}
                  userId={currentUser?.uid}
                  filters={filters}
                  onRemoveFilter={handleRemoveFilter}
                  onClearAllFilters={handleClearAll}
                />
              </>
            )}

            <FilterDrawer
              open={isFilterDrawerOpen}
              onClose={() => setIsFilterDrawerOpen(false)}
              filters={filters}
              onToggleFilter={handleToggleFilter}
              onPriceChange={handlePriceChange}
              onClearGroup={handleClearGroup}
              onClearAll={handleClearAll}
              onApply={handleApplyFilters}
            />

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
