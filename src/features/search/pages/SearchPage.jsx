import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  Snackbar,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TuneIcon from "@mui/icons-material/Tune";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import UserDescriptionInput from "../components/SearchInputBar";
import SearchResults from "../components/SearchResults";
import SearchSortBar from "../components/SearchSortBar";
import Footer from "../../../shared/ui/navigation/Footer";
import ProfileSearchPageHeader from "../../../shared/ui/navigation/SearchPageHeader";
import FilterDrawer from "../filters/FilterDrawer";
import { fetchCombinedResults } from "../services/fetchSearchResults";
import {
  createDefaultFilters,
  toggleFilterValue,
  setPriceFilterValue,
  clearFilterGroup,
  clearAllFilters,
  removeFilterValue,
  getActiveFilterCount,
} from "../utils/filterHelpers";
import {
  parseSearchState,
  buildSearchStateQuery,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
} from "../utils/searchStateHelpers";
import { auth, db } from "../../../backend/firebase/firebase";
import { colors, layout } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  heroPanelSx,
} from "../../../shared/ui/theme/componentStyles";

const defaultTheme = createTheme();

const DEFAULT_SEARCH_META = {
  total: 0,
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  warnings: [],
  sources: [],
};

function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initializedFromUrl = useRef(false);
  const suppressNextAutoSearch = useRef(false);

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

  const handleSearchResults = useCallback((response, append = false) => {
    const results = Array.isArray(response)
      ? response
      : response?.results || [];

    const nextSources = Array.isArray(response?.sources)
      ? response.sources
      : response?.sources
        ? Object.values(response.sources)
        : [];

    setSearchResults((prev) => (append ? [...prev, ...results] : results));
    setSearchMeta({
      total: response?.total ?? results.length,
      page: response?.page ?? DEFAULT_PAGE,
      pageSize: response?.pageSize ?? DEFAULT_PAGE_SIZE,
      hasMore: response?.hasMore ?? false,
      warnings: response?.warnings ?? [],
      sources: nextSources,
    });
    setIsLoading(false);
  }, []);

  const runSearch = useCallback(
    async ({
      query,
      activeFilters = filters,
      activeGender = showAllGenders ? undefined : onboardingGender,
      sort = sortBy,
      page = DEFAULT_PAGE,
      append = false,
      shouldSyncUrl = true,
    }) => {
      if (!query?.trim()) {
        setSearchResults([]);
        setSearchMeta(DEFAULT_SEARCH_META);
        setIsLoading(false);

        if (shouldSyncUrl) {
          syncUrlState("", activeFilters, sort, DEFAULT_PAGE);
        }

        return DEFAULT_SEARCH_META;
      }

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
        setError(searchError?.message || "Failed to fetch search results.");
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

  const handleSaveSearch = async (searchQuery) => {
    if (!currentUser) {
      setError("You must be logged in to save searches.");
      return;
    }

    try {
      await addDoc(collection(db, "users", currentUser.uid, "savedSearches"), {
        query: searchQuery,
        filters,
        sort: sortBy,
        page: currentPage,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage("Search saved successfully.");
    } catch (saveError) {
      console.error("Error saving search", saveError);
      setError("Error saving search.");
    }
  };

  const handleSaveItem = async (item) => {
    if (!currentUser) {
      setError("You must be logged in to save items.");
      return;
    }

    try {
      await addDoc(collection(db, "users", currentUser.uid, "savedItems"), {
        ...item,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage("Item saved successfully.");
    } catch (saveError) {
      console.error("Error saving item", saveError);
      setError("Error saving item.");
    }
  };

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
    suppressNextAutoSearch.current = true;
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
    const updatedFilters = removeFilterValue(filters, key, value);
    suppressNextAutoSearch.current = true;
    setFilters(updatedFilters);
    setCurrentPage(DEFAULT_PAGE);

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
  };

  const handleApplyFilters = async () => {
    setIsFilterDrawerOpen(false);

    if (!searchInputValue.trim()) {
      syncUrlState(searchInputValue, filters, sortBy, DEFAULT_PAGE);
      return;
    }

    suppressNextAutoSearch.current = true;

    await runSearch({
      query: searchInputValue,
      activeFilters: filters,
      sort: sortBy,
      page: DEFAULT_PAGE,
    });
  };

  const handleSortChange = async (nextSort) => {
    suppressNextAutoSearch.current = true;
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
    setSearchInputValue(parsedState.query);
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

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!initializedFromUrl.current) return;
    if (!searchInputValue.trim()) return;

    if (suppressNextAutoSearch.current) {
      suppressNextAutoSearch.current = false;
      return;
    }

    runSearch({
      query: searchInputValue,
      activeFilters: filters,
      activeGender: showAllGenders ? undefined : onboardingGender,
      sort: sortBy,
      page: DEFAULT_PAGE,
    });
  }, [
    showAllGenders,
    onboardingGender,
    runSearch,
    searchInputValue,
    filters,
    sortBy,
  ]);

  const activeFilterCount = getActiveFilterCount(filters);
  const personalizationActive = Boolean(onboardingGender) && !showAllGenders;

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.background,
          color: colors.textPrimary,
          overflowX: "hidden",
          backgroundImage:
            "radial-gradient(circle at top, rgba(89,230,219,0.06), transparent 30%)",
        }}
      >
        <ProfileSearchPageHeader />

        <Box component="main" sx={{ flex: 1 }}>
          <Container maxWidth={layout.pageMax} sx={{ py: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              <Box
                sx={{
                  ...heroPanelSx,
                  px: { xs: 2.25, md: 3.5 },
                  py: { xs: 2.5, md: 3.5 },
                }}
              >
                <Stack spacing={2.25}>
                  <Box>
                    <Typography
                      sx={{
                        color: colors.textPrimary,
                        fontWeight: 850,
                        fontSize: { xs: "1.7rem", md: "2.45rem" },
                        lineHeight: 1.08,
                        mb: 1,
                      }}
                    >
                      Search for the exact look you have in mind
                    </Typography>

                    <Typography
                      sx={{
                        color: colors.textSecondary,
                        maxWidth: 760,
                        lineHeight: 1.75,
                      }}
                    >
                      Describe what you want in natural language, refine the
                      results with filters, and save the pieces worth coming
                      back to.
                    </Typography>
                  </Box>

                  <UserDescriptionInput
                    value={searchInputValue}
                    onChange={(event) =>
                      setSearchInputValue(event.target.value)
                    }
                    onSearchStart={() => {
                      setIsLoading(true);
                      setError(null);
                    }}
                    onSaveSearch={handleSaveSearch}
                    onSearchError={(errorMessage) => {
                      setError(errorMessage);
                      setIsLoading(false);
                    }}
                    onSearchResults={(response) =>
                      handleSearchResults(response, false)
                    }
                    onSearchSubmit={(query) => {
                      suppressNextAutoSearch.current = true;
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
                    activeFilterCount={activeFilterCount}
                  />

                  <Stack
                    direction={{ xs: "column", lg: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "flex-start", lg: "center" }}
                    justifyContent="space-between"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip
                        icon={<TuneIcon />}
                        label={`${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`}
                        sx={{
                          color: colors.textPrimary,
                          bgcolor: colors.surface2,
                          border: `1px solid ${colors.border}`,
                        }}
                      />

                      <Chip
                        icon={<AutoAwesomeRoundedIcon />}
                        label={
                          personalizationActive
                            ? "Prioritizing your onboarding preference"
                            : "Showing all gender results"
                        }
                        sx={{
                          color: personalizationActive
                            ? colors.accent
                            : colors.textSecondary,
                          bgcolor: personalizationActive
                            ? colors.accentSoft
                            : colors.surface2,
                          border: `1px solid ${
                            personalizationActive
                              ? colors.accentBorder
                              : colors.border
                          }`,
                        }}
                      />
                    </Stack>

                    <FormControlLabel
                      sx={{ color: colors.textPrimary, ml: 0 }}
                      control={
                        <Switch
                          checked={showAllGenders}
                          onChange={(event) =>
                            setShowAllGenders(event.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label="Show all genders"
                    />
                  </Stack>

                  {personalizationActive ? (
                    <Typography
                      sx={{
                        color: colors.textMuted,
                        fontSize: "0.92rem",
                      }}
                    >
                      Results are being prioritized using your onboarding
                      preference, but you can broaden them anytime.
                    </Typography>
                  ) : null}

                  {searchMeta.warnings.length > 0 ? (
                    <Typography
                      sx={{ color: colors.textMuted, fontSize: "0.92rem" }}
                    >
                      {searchMeta.warnings.join(" ")}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>

              {searchResults.length > 0 || isLoading ? (
                <SearchSortBar
                  value={sortBy}
                  onChange={handleSortChange}
                  total={searchMeta.total}
                  visibleCount={searchResults.length}
                  viewMode={viewMode}
                  onViewChange={setViewMode}
                />
              ) : null}

              <SearchResults
                results={searchResults}
                isLoading={isLoading}
                hasSearched={searchInputValue.trim().length > 0}
                query={searchInputValue}
                suggestions={[
                  "Try a broader search like black dress or oversized blazer",
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

              {searchMeta.hasMore && searchResults.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    mt: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    sx={primaryButtonSx}
                  >
                    {isLoading ? "Loading more..." : "Load more"}
                  </Button>
                </Box>
              ) : null}
            </Stack>
          </Container>
        </Box>

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
          autoHideDuration={5000}
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

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default SearchPage;
