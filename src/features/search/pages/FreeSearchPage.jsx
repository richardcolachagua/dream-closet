import { useEffect, useState, useCallback, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getAnalytics, logEvent } from "firebase/analytics";
import { httpsCallable } from "firebase/functions";

import Footer from "../../../shared/ui/navigation/Footer";
import SearchResults from "../../search/components/SearchResults";
import Header from "../../../shared/ui/navigation/PublicHeader";
import UserDescriptionInput from "../../search/components/SearchInputBar";
import SearchSortControls from "../../search/components/SearchSortBar";
import FilterDrawer from "../filters/FilterDrawer";

import {
  functions,
  analytics as analyticsExport,
} from "../../../backend/firebase/firebase";
import { fetchCombinedResults } from "../../search/services/fetchSearchResults";
import {
  createDefaultFilters,
  toggleFilterValue,
  setPriceFilterValue,
  clearFilterGroup,
  clearAllFilters,
  removeFilterValue,
  getActiveFilterCount,
} from "../../search/utils/filterHelpers";
import {
  DEFAULT_SORT,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
} from "../../search/utils/searchStateHelpers";

// Use provided analytics instance if available, else getAnalytics
const analytics = analyticsExport || getAnalytics();
const defaultTheme = createTheme();

const DEFAULT_SEARCH_META = {
  total: 0,
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  warnings: [],
  sources: {},
};

const FreeSearchPage = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(DEFAULT_SEARCH_META);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [filters, setFilters] = useState(createDefaultFilters());
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Free-limit-specific state
  const [remainingSearches, setRemainingSearches] = useState(3);
  const [resetTime, setResetTime] = useState(null);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);

  // Prevent double-init if needed later
  const initializedRef = useRef(false);

  // ---------- Free search limit logic ----------

  const checkSearchLimit = useCallback(async () => {
    try {
      const callable = httpsCallable(functions, "checkSearchLimit");
      const result = await callable();

      setRemainingSearches(result.data?.remainingSearches ?? 0);
      setResetTime(result.data?.resetTime ?? null);

      return result.data;
    } catch (err) {
      console.error("Error checking search limit", err);
      setError("Error checking search limit. Please try again.");
      throw err;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    checkSearchLimit();
  }, [checkSearchLimit]);

  const Timer = () => {
    const [timeRemaining, setTimeRemaining] = useState("");

    useEffect(() => {
      const updateTimer = () => {
        if (resetTime) {
          const now = new Date();
          const diff = new Date(resetTime) - now;

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setTimeRemaining("");
            checkSearchLimit();
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }, [resetTime, checkSearchLimit]);

    return timeRemaining ? (
      <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
        Resets in: {timeRemaining}
      </Typography>
    ) : null;
  };

  // ---------- Shared search orchestration (aligned with paid page) ----------

  const handleSearchResults = useCallback(
    (response, append = false) => {
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

      logEvent(analytics, "free_search", {
        search_term: searchInputValue || "unknown",
        result_count: results.length || 0,
      });
    },
    [searchInputValue],
  );

  const runSearch = useCallback(
    async ({
      query,
      activeFilters = filters,
      sort = sortBy,
      page = DEFAULT_PAGE,
      append = false,
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check limit before performing search
        const latestLimit = await checkSearchLimit();
        if (!latestLimit || latestLimit.remainingSearches <= 0) {
          setShowSignUpDialog(true);
          setIsLoading(false);
          return [];
        }

        const response = await fetchCombinedResults({
          query,
          filters: activeFilters,
          onboardingGender: "",
          sort,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        });

        handleSearchResults(response, append);
        setCurrentPage(page);

        // Re-check limit after search to maybe show dialog
        const updatedLimit = await checkSearchLimit();
        if (updatedLimit?.remainingSearches <= 0) {
          setShowSignUpDialog(true);
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
    [filters, sortBy, checkSearchLimit, handleSearchResults],
  );

  // ---------- Handlers (mirroring paid SearchPage) ----------

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    logEvent(analytics, "search_error", { error_message: errorMessage });
  };

  const handleSearchSubmit = async (query) => {
    setSearchInputValue(query);
    setCurrentPage(DEFAULT_PAGE);

    return runSearch({
      query,
      activeFilters: filters,
      sort: sortBy,
      page: DEFAULT_PAGE,
    });
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSortChange = async (nextSort) => {
    setSortBy(nextSort);
    setCurrentPage(DEFAULT_PAGE);

    if (!searchInputValue.trim()) {
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

  // Filter handlers (even if you choose to hide filter UI for free users, logic is ready)
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
      }

      return updatedFilters;
    });

    setCurrentPage(DEFAULT_PAGE);
  };

  const handleApplyFilters = async () => {
    if (!searchInputValue.trim()) {
      setIsFilterDrawerOpen(false);
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
        <Header />
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
                mb: 1,
              }}
            >
              Try Dream Closet
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "white",
                textAlign: "center",
                mb: 2,
              }}
            >
              {remainingSearches} free searches remaining
            </Typography>

            <Timer />

            <UserDescriptionInput
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onSearchStart={handleSearchStart}
              onSearchError={handleSearchError}
              onSearchResults={(response) =>
                handleSearchResults(response, false)
              }
              onSearchSubmit={handleSearchSubmit}
              onSaveSearch={null} // no saving in free tier
              onOpenFilters={() => setIsFilterDrawerOpen(true)}
              activeFilterCount={getActiveFilterCount(filters)}
              saveDisabled // ensures SaveSearchButton is hidden/disabled
            />

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
                        {/* icons colored to match paid page */}
                        <span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <path d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </span>
                      </ToggleButton>
                      <ToggleButton value="grid" aria-label="grid view">
                        <span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          >
                            <rect x="4" y="4" width="6" height="6" />
                            <rect x="14" y="4" width="6" height="6" />
                            <rect x="4" y="14" width="6" height="6" />
                            <rect x="14" y="14" width="6" height="6" />
                          </svg>
                        </span>
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
                  onSaveItem={null} // disable save items for free users
                  viewMode={viewMode}
                  userId={null}
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

      <Dialog
        open={showSignUpDialog}
        onClose={() => setShowSignUpDialog(false)}
      >
        <DialogTitle>Sign up to continue</DialogTitle>
        <DialogContent>
          <Typography>
            You’ve reached the limit of free searches. Sign up to continue using
            Dream Closet and unlock unlimited search.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignUpDialog(false)}>Close</Button>
          <Button
            onClick={() => {
              window.location.href = "/signuppage";
            }}
          >
            Sign up
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FreeSearchPage;
