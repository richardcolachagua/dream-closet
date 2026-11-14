import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  CssBaseline,
  FormControlLabel,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { useLocation, useNavigate } from "react-router-dom";
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
import { useAuth } from "../../auth/AuthContext";
import { saveItem, saveSearch } from "../../saved/savedDataService";
import { colors, layout } from "../../../shared/ui/theme/designTokens";
import { heroPanelSx } from "../../../shared/ui/theme/componentStyles";

const theme = createTheme();
const EMPTY_META = {
  total: 0,
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  hasMore: false,
  warnings: [],
  sources: [],
};

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, profileLoading, isRegistered } = useAuth();
  const [initial] = useState(() => parseSearchState(location.search));
  const [searchInputValue, setSearchInputValue] = useState(initial.query);
  const [filters, setFilters] = useState(
    initial.filters || createDefaultFilters(),
  );
  const [sortBy, setSortBy] = useState(initial.sort || DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(initial.page || DEFAULT_PAGE);
  const [searchResults, setSearchResults] = useState([]);
  const [searchMeta, setSearchMeta] = useState(EMPTY_META);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [showAllGenders, setShowAllGenders] = useState(false);
  const initialized = useRef(false);
  const requestId = useRef(0);
  const currentUid = useRef(user?.uid);
  currentUid.current = user?.uid;
  const onboardingGender = profile?.onboarding?.gender || "";

  useEffect(() => {
    initialized.current = false;
    requestId.current += 1;
    setSearchResults([]);
    setSearchMeta(EMPTY_META);
    setIsLoading(false);
    setHasSearched(false);
    setError("");
    setSuccessMessage("");
    setSavingSearch(false);
    return () => {
      requestId.current += 1;
    };
  }, [user?.uid]);

  const syncUrl = useCallback(
    (query, activeFilters, sort, page) => {
      const search = buildSearchStateQuery({
        query,
        filters: activeFilters,
        sort,
        page,
      });
      navigate(
        { pathname: location.pathname, search: search ? `?${search}` : "" },
        { replace: true },
      );
    },
    [navigate, location.pathname],
  );

  const runSearch = useCallback(
    async ({
      query,
      activeFilters,
      sort,
      page = DEFAULT_PAGE,
      append = false,
      allGenders = showAllGenders,
      sync = true,
    }) => {
      const id = ++requestId.current;
      const uid = user?.uid;
      if (!query?.trim()) {
        setSearchResults([]);
        setSearchMeta(EMPTY_META);
        setIsLoading(false);
        if (sync) syncUrl("", activeFilters, sort, DEFAULT_PAGE);
        return null;
      }
      setIsLoading(true);
      setError("");
      setHasSearched(true);
      try {
        const response = await fetchCombinedResults({
          query,
          filters: activeFilters,
          onboardingGender: allGenders ? undefined : onboardingGender,
          sort,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        });
        if (id !== requestId.current || uid !== currentUid.current) return null;
        const results = Array.isArray(response)
          ? response
          : response?.results || [];
        setSearchResults((previous) =>
          append ? [...previous, ...results] : results,
        );
        setSearchMeta({
          ...EMPTY_META,
          total: response?.total ?? results.length,
          page: response?.page ?? page,
          pageSize: response?.pageSize ?? DEFAULT_PAGE_SIZE,
          hasMore: response?.hasMore ?? false,
          warnings: response?.warnings || [],
          sources: Array.isArray(response?.sources)
            ? response.sources
            : Object.values(response?.sources || {}),
        });
        setCurrentPage(page);
        if (sync) syncUrl(query, activeFilters, sort, page);
        return response;
      } catch (failure) {
        if (id !== requestId.current || uid !== currentUid.current) return null;
        if (!append) {
          setSearchResults([]);
          setSearchMeta(EMPTY_META);
        }
        setError(failure.message || "Could not fetch search results.");
        return null;
      } finally {
        if (id === requestId.current && uid === currentUid.current)
          setIsLoading(false);
      }
    },
    [user?.uid, showAllGenders, onboardingGender, syncUrl],
  );

  useEffect(() => {
    if (profileLoading || initialized.current) return;
    initialized.current = true;
    if (initial.query) {
      void runSearch({
        query: initial.query,
        activeFilters: initial.filters,
        sort: initial.sort,
        page: initial.page,
        sync: false,
      });
    }
  }, [profileLoading, initial, runSearch]);

  const searchWith = (
    nextFilters = filters,
    nextSort = sortBy,
    allGenders = showAllGenders,
  ) =>
    runSearch({
      query: searchInputValue,
      activeFilters: nextFilters,
      sort: nextSort,
      allGenders,
    });

  const handleSaveSearch = async (query) => {
    const uid = user?.uid;
    if (!isRegistered || !uid || savingSearch) return;
    setSavingSearch(true);
    try {
      await saveSearch(uid, {
        query,
        filters,
        sort: sortBy,
        page: currentPage,
      });
      if (currentUid.current === uid)
        setSuccessMessage("Search saved successfully.");
    } catch (failure) {
      if (currentUid.current === uid) setError(failure.message);
    } finally {
      setSavingSearch(false);
    }
  };
  const handleSaveItem = async (item) => {
    const uid = user?.uid;
    try {
      await saveItem(uid, item);
      if (currentUid.current === uid)
        setSuccessMessage("Item saved successfully.");
    } catch (failure) {
      if (currentUid.current === uid) setError(failure.message);
    }
  };
  const handleClearAll = () => {
    const next = clearAllFilters();
    setFilters(next);
    void searchWith(next);
  };
  const handleRemoveFilter = (key, value) => {
    const next = removeFilterValue(filters, key, value);
    setFilters(next);
    void searchWith(next);
  };
  const activeFilterCount = getActiveFilterCount(filters);
  const personalizationActive = Boolean(onboardingGender) && !showAllGenders;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: colors.background,
          color: colors.textPrimary,
          overflowX: "hidden",
        }}
      >
        <ProfileSearchPageHeader />
        <Box component="main" sx={{ flex: 1 }}>
          <Container maxWidth={layout.pageMax} sx={{ py: { xs: 4, md: 6 } }}>
            <Stack spacing={3}>
              <Box sx={{ ...heroPanelSx, px: { xs: 2.25, md: 3.5 }, py: 3 }}>
                <Stack spacing={2.25}>
                  <Typography variant="h4" sx={{ fontWeight: 850 }}>
                    Search for the exact look you have in mind
                  </Typography>
                  <Typography sx={{ color: colors.textSecondary }}>
                    Describe what you want, refine the results, and save pieces
                    worth coming back to.
                  </Typography>
                  <UserDescriptionInput
                    value={searchInputValue}
                    onChange={(event) =>
                      setSearchInputValue(event.target.value)
                    }
                    onSearchStart={() => {
                      setIsLoading(true);
                      setError("");
                    }}
                    onSaveSearch={handleSaveSearch}
                    savingSearch={savingSearch}
                    saveDisabled={!isRegistered}
                    onSearchError={(message) => {
                      setError(message);
                      setIsLoading(false);
                    }}
                    onSearchSubmit={(query) => {
                      setSearchInputValue(query);
                      return runSearch({
                        query,
                        activeFilters: filters,
                        sort: sortBy,
                      });
                    }}
                    onOpenFilters={() => setIsFilterDrawerOpen(true)}
                    activeFilterCount={activeFilterCount}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${activeFilterCount} active filters`} />
                    <Chip
                      icon={<AutoAwesomeRoundedIcon />}
                      label={
                        personalizationActive
                          ? "Prioritizing your onboarding preference"
                          : "Showing all gender results"
                      }
                    />
                  </Stack>
                  <FormControlLabel
                    label="Show all genders"
                    control={
                      <Switch
                        checked={showAllGenders}
                        onChange={(event) => {
                          const next = event.target.checked;
                          setShowAllGenders(next);
                          if (hasSearched)
                            void searchWith(filters, sortBy, next);
                        }}
                      />
                    }
                  />
                </Stack>
              </Box>
              {(searchResults.length > 0 || isLoading) && (
                <SearchSortBar
                  value={sortBy}
                  onChange={(next) => {
                    setSortBy(next);
                    void searchWith(filters, next);
                  }}
                  total={searchMeta.total}
                  visibleCount={searchResults.length}
                  viewMode={viewMode}
                  onViewChange={setViewMode}
                />
              )}
              <SearchResults
                results={searchResults}
                isLoading={isLoading}
                hasSearched={hasSearched}
                query={searchInputValue}
                suggestions={[
                  "Try a broader search",
                  "Remove one or two filters",
                  "Search by occasion, color, or item type",
                ]}
                onSaveItem={handleSaveItem}
                viewMode={viewMode}
                userId={isRegistered ? user?.uid : undefined}
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAll}
              />
              {searchMeta.hasMore && searchResults.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                  <Button
                    variant="outlined"
                    disabled={isLoading}
                    onClick={() => {
                      void runSearch({
                        query: searchInputValue,
                        activeFilters: filters,
                        sort: sortBy,
                        page: currentPage + 1,
                        append: true,
                      });
                    }}
                  >
                    {isLoading ? "Loading more..." : "Load more"}
                  </Button>
                </Box>
              )}
              {searchMeta.warnings.length > 0 && (
                <Alert severity="info">{searchMeta.warnings.join(" ")}</Alert>
              )}
            </Stack>
          </Container>
        </Box>
        <FilterDrawer
          open={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          filters={filters}
          onToggleFilter={(key, value) =>
            setFilters((previous) => toggleFilterValue(previous, key, value))
          }
          onPriceChange={(key, value) =>
            setFilters((previous) => setPriceFilterValue(previous, key, value))
          }
          onClearGroup={(key) =>
            setFilters((previous) => clearFilterGroup(previous, key))
          }
          onClearAll={handleClearAll}
          onApply={() => {
            setIsFilterDrawerOpen(false);
            return searchWith();
          }}
        />
        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={5000}
          onClose={() => setSuccessMessage("")}
        >
          <Alert severity="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError("")}
        >
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        </Snackbar>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
