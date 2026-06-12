import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import UserDescriptionInput from "../../Components/Search-Components/Searchbars/UserInputDescription";
import SearchResults from "../../Components/Search-Components/SearchResults";
import Footer from "../../Components/Footer";
import SearchPageHeader from "../../Components/Headers/SearchPageHeader";
import FilterDrawer from "../../Components/Search-Components/Filters/FilterDrawer";
import SearchSortControls from "../../Components/Search-Components/SearchSortControls";
import { fetchCombinedResults } from "../../Components/Search-Components/utils/fetchCombinedResults";
import {
  createDefaultFilters,
  toggleFilterValue,
  setPriceFilterValue,
  clearFilterGroup,
  clearAllFilters,
  removeFilterValue,
  getActiveFilterCount,
} from "../../Components/Search-Components/utils/filterHelpers";
import {
  parseSearchState,
  buildSearchStateQuery,
  DEFAULT_SORT,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../../Components/Search-Components/utils/searchStateHelpers";
import { db, auth } from "../../../backend/firebase";

const defaultTheme = createTheme();

const DEFAULT_SEARCH_META = {
  total: 0,
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  warnings: [],
  sources: {},
};

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initializedFromUrl = useRef(false);

  const parsedState = useMemo(
    () => parseSearchState(location.search),
    [location.search],
  );

  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(DEFAULT_SEARCH_META);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentUser, setCurrentUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [searchInputValue, setSearchInputValue] = useState(parsedState.query);
  const [filters, setFilters] = useState(
    parsedState.filters || createDefaultFilters(),
  );
  const [sortBy, setSortBy] = useState(parsedState.sort || DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(
    parsedState.page || DEFAULT_PAGE,
  );
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [onboardingGender, setOnboardingGender] = useState("");
  const [showAllGenders, setShowAllGenders] = useState(false);

  const syncUrlState = useCallback(
    (nextQuery, nextFilters, nextSort, nextPage = DEFAULT_PAGE) => {
      const search = buildSearchStateQuery({
        query: nextQuery,
        filters: nextFilters,
        sort: nextSort,
        page: nextPage,
      });

      navigate(
        {
          pathname: location.pathname,
          search: search ? `?${search}` : "",
        },
        { replace: true },
      );
    },
    [navigate, location.pathname],
  );

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
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
        sort: sortBy,
        page: currentPage,
        userId: currentUser.uid,
        date: new Date().toISOString(),
      });
      setSuccessMessage("Search saved successfully!");
    } catch (saveError) {
      setError("Error saving search.");
      console.error("Error saving search", saveError);
    }
  };

  const handleSaveItem = async (item) => {
    if (!currentUser) {
      setError("You must be logged in to save items.");
      return;
    }

    try {
      await addDoc(collection(db, "saved-items"), {
        ...item,
        userId: currentUser.uid,
      });
    } catch (saveError) {
      console.error("Error saving item", saveError);
      setError("Error saving item.");
    }
  };

  const handleSearchResults = useCallback((response, append = false) => {
    const results = Array.isArray(response)
      ? response
      : response?.results || [];

    setSearchResults((prev) => (append ? [...prev, ...results] : results));
    setSearchMeta({
      total: response?.total ?? results.length,
      page: response?.page ?? DEFAULT_PAGE,
      pageSize: response?.pageSize ?? DEFAULT_PAGE_SIZE,
      hasMore: response?.hasMore ?? false,
      warnings: response?.warnings ?? [],
      sources: response?.sources ?? {},
    });
    setIsLoading(false);
  }, []);

  const runSearch = useCallback(
    async ({
      query,
      activeFilters = filters,
      activeGender = showAllGenders ? "" : onboardingGender,
      sort = sortBy,
      page = DEFAULT_PAGE,
      append = false,
      shouldSyncUrl = true,
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchCombinedResults({
          query,
          filters: activeFilters,
          onboardingGender: activeGender,
          sort,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        });

        handleSearchResults(response, append);
        setCurrentPage(page);

        if (shouldSyncUrl) {
          syncUrlState(query, activeFilters, sort, page);
        }

        return response;
      } catch (searchError) {
        console.error("Failed to fetch search results", searchError);

        if (!append) {
          setSearchResults([]);
          setSearchMeta(DEFAULT_SEARCH_META);
        }

        setIsLoading(false);
        setError("Failed to fetch search results.");
        throw searchError;
      }
    },
    [
      filters,
      onboardingGender,
      showAllGenders,
      sortBy,
      handleSearchResults,
      syncUrlState,
    ],
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
    setCurrentPage(DEFAULT_PAGE);

    if (searchInputValue.trim()) {
      runSearch({
        query: searchInputValue,
        activeFilters: clearedFilters,
        sort: sortBy,
        page: DEFAULT_PAGE,
      });
    } else {
      syncUrlState(searchInputValue, clearedFilters, sortBy, DEFAULT_PAGE);
    }
  };

  const handleRemoveFilter = (key, value) => {
    setFilters((prev) => {
      const updatedFilters = removeFilterValue(prev, key, value);

      if (searchInputValue.trim()) {
        runSearch({
          query: searchInputValue,
          activeFilters: updatedFilters,
          sort: sortBy,
          page: DEFAULT_PAGE,
        });
      } else {
        syncUrlState(searchInputValue, updatedFilters, sortBy, DEFAULT_PAGE);
      }

      return updatedFilters;
    });

    setCurrentPage(DEFAULT_PAGE);
  };

  const handleApplyFilters = async () => {
    if (!searchInputValue.trim()) {
      setIsFilterDrawerOpen(false);
      syncUrlState(searchInputValue, filters, sortBy, DEFAULT_PAGE);
      return;
    }

    await runSearch({
      query: searchInputValue,
      activeFilters: filters,
      sort: sortBy,
      page: DEFAULT_PAGE,
    });

    setIsFilterDrawerOpen(false);
  };

  const handleSortChange = async (nextSort) => {
    setSortBy(nextSort);
    setCurrentPage(DEFAULT_PAGE);

    if (!searchInputValue.trim()) {
      syncUrlState(searchInputValue, filters, nextSort, DEFAULT_PAGE);
      return;
    }

    await runSearch({
      query: searchInputValue,
      activeFilters: filters,
      sort: nextSort,
      page: DEFAULT_PAGE,
    });
  };

  const handleLoadMore = async () => {
    if (!searchInputValue.trim() || !searchMeta.hasMore || isLoading) return;

    const nextPage = currentPage + 1;

    await runSearch({
      query: searchInputValue,
      activeFilters: filters,
      sort: sortBy,
      page: nextPage,
      append: true,
    });
  };

  useEffect(() => {
    if (initializedFromUrl.current) return;
    initializedFromUrl.current = true;

    setSearchInputValue(parsedState.query || "");
    setFilters(parsedState.filters || createDefaultFilters());
    setSortBy(parsedState.sort || DEFAULT_SORT);
    setCurrentPage(parsedState.page || DEFAULT_PAGE);

    if (parsedState.query) {
      runSearch({
        query: parsedState.query,
        activeFilters: parsedState.filters || createDefaultFilters(),
        sort: parsedState.sort || DEFAULT_SORT,
        page: parsedState.page || DEFAULT_PAGE,
        shouldSyncUrl: false,
      });
    }
  }, [parsedState, runSearch]);

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
      } catch (loadError) {
        console.error("Error loading onboarding gender", loadError);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!initializedFromUrl.current) return;
    if (!searchInputValue.trim()) return;

    runSearch({
      query: searchInputValue,
      activeFilters: filters,
      activeGender: showAllGenders ? "" : onboardingGender,
      sort: sortBy,
      page: DEFAULT_PAGE,
    });
  }, [showAllGenders, onboardingGender]);

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
              onSearchResults={(response) =>
                handleSearchResults(response, false)
              }
              onSearchSubmit={(query) => {
                setSearchInputValue(query);
                setCurrentPage(DEFAULT_PAGE);

                return runSearch({
                  query,
                  activeFilters: filters,
                  sort: sortBy,
                  page: DEFAULT_PAGE,
                });
              }}
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              activeFilterCount={getActiveFilterCount(filters)}
            />

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", md: "row" },
                gap: 1,
                mt: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                sx={{ color: "white", ml: 0 }}
                control={
                  <Switch
                    checked={showAllGenders}
                    onChange={(e) => setShowAllGenders(e.target.checked)}
                    color="primary"
                  />
                }
                label="Show all genders"
              />

              {searchMeta.warnings.length > 0 && (
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.72)", textAlign: "right" }}
                >
                  {searchMeta.warnings.join(" • ")}
                </Typography>
              )}
            </Box>

            {isLoading && searchResults.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!isLoading || searchResults.length > 0 ? (
              <>
                {searchInputValue.trim().length > 0 && (
                  <SearchSortControls
                    value={sortBy}
                    onChange={handleSortChange}
                    total={searchMeta.total}
                  />
                )}

                {searchResults.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "center" },
                      flexDirection: { xs: "column", md: "row" },
                      gap: 1,
                      width: "100%",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      Showing {searchResults.length} of {searchMeta.total}{" "}
                      results
                    </Typography>

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
                  isLoading={isLoading && searchResults.length === 0}
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

                {searchMeta.hasMore && searchResults.length > 0 && (
                  <Box
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      mt: 3,
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      sx={{
                        bgcolor: "turquoise",
                        color: "black",
                        fontWeight: "bold",
                        textTransform: "none",
                        "&:hover": { bgcolor: "darkturquoise" },
                      }}
                    >
                      {isLoading ? "Loading more..." : "Load more"}
                    </Button>
                  </Box>
                )}
              </>
            ) : null}

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
