import { useEffect, useRef, useState } from "react";
import {
  Alert, Box, Button, Container, CssBaseline, FormControlLabel,
  Stack, Switch, TextField, Typography,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import PublicHeader from "../../../shared/ui/navigation/PublicHeader";
import SearchPageHeader from "../../../shared/ui/navigation/SearchPageHeader";
import Footer from "../../../shared/ui/navigation/Footer";
import { colors, layout } from "../../../shared/ui/theme/designTokens";
import SearchResults from "./SearchResults";
import SearchSortBar from "./SearchSortBar";
import SearchQuotaSummary from "./SearchQuotaSummary";
import { searchWorkspaceTheme } from "./searchWorkspaceTheme";
import FilterDrawer from "../filters/FilterDrawer";
import {
  toggleFilterValue, setPriceFilterValue, clearFilterGroup,
  clearAllFilters, removeFilterValue, getActiveFilterCount,
} from "../utils/filterHelpers";
import { parseSearchState, buildSearchStateQuery } from "../utils/searchStateHelpers";
import { searchIdentity } from "../services/searchSession";
import { useCallableSearch, searchErrorMessage } from "../hooks/useCallableSearch";
import { saveItem, saveSearch } from "../../saved/savedDataService";

const fieldsetSx = { border: 0, p: 0, m: 0, minWidth: 0 };

export default function CallableSearchWorkspace({ user, profile = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial] = useState(() => parseSearchState(location.search));
  const [query, setQuery] = useState(initial.query);
  const [filters, setFilters] = useState(initial.filters);
  const [sort, setSort] = useState(initial.sort);
  const [allGenders, setAllGenders] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const alive = useRef(false);
  const initialStarted = useRef(false);
  const registered = !user.isAnonymous;
  const search = useCallableSearch(searchIdentity(user));
  const response = search.response;
  const busy = search.loading;
  const exhausted = search.quota?.remaining === 0 && !search.quota?.unlimited;
  const gender = allGenders ? "" : (profile?.onboarding?.gender || "");
  const visibleFilters = response ? search.responsePayload?.filters || filters : filters;

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const updateUrl = (payload) => {
    const value = buildSearchStateQuery({
      query: payload.query, filters: payload.filters,
      sort: payload.sort, page: payload.page,
    });
    navigate({ pathname: location.pathname, search: value ? `?${value}` : "" }, { replace: true });
  };

  useEffect(() => {
    if (initialStarted.current) return;
    initialStarted.current = true;
    if (initial.query) {
      void search.submit({
        query: initial.query, filters: initial.filters, sort: initial.sort,
        page: initial.page, pageSize: 24,
        onboardingGender: profile?.onboarding?.gender || "",
      });
    }
  }, [initial, profile, search]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy || exhausted || !query.trim()) return;
    const payload = { query, filters, sort, page: 1, pageSize: 24, onboardingGender: gender };
    const result = await search.submit(payload);
    if (alive.current && result) updateUrl(payload);
  };

  const refine = async (next = {}, append = false) => {
    if (!search.lastPayload || busy) return;
    const payload = { ...search.lastPayload, page: 1, ...next };
    const result = await search.refine(payload, append);
    if (alive.current && result) updateUrl(payload);
  };

  const clearFilters = () => {
    const next = clearAllFilters();
    setFilters(next);
    void refine({ filters: next });
  };

  const removeFilter = (key, value) => {
    const next = removeFilterValue(visibleFilters, key, value);
    setFilters(next);
    void refine({ filters: next });
  };

  const saveCurrentSearch = async () => {
    if (!registered || !search.responsePayload || saving) return;
    setSaving(true);
    try {
      const payload = search.responsePayload;
      await saveSearch(user.uid, {
        query: payload.query, filters: payload.filters,
        sort: payload.sort, page: payload.page,
      });
      if (alive.current) setNotice("Search saved.");
    } catch (error) {
      if (alive.current) setNotice(error.message);
    } finally {
      if (alive.current) setSaving(false);
    }
  };

  const saveProduct = async (item) => {
    try {
      await saveItem(user.uid, item);
      if (alive.current) setNotice("Item saved.");
    } catch (error) {
      if (alive.current) setNotice(error.message);
    }
  };

  return (
    <ThemeProvider theme={searchWorkspaceTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: colors.background,
        color: colors.textPrimary, display: "flex", flexDirection: "column" }}>
        {registered ? <SearchPageHeader /> : <PublicHeader />}
        <Container component="main" maxWidth={layout.pageMax}
          sx={{ flex: 1, py: { xs: 3, md: 5 } }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                {registered ? "Find your next look" : "Find the look you have in mind"}
              </Typography>
              <Typography color="text.secondary">Describe a piece, explore the matches, and make it yours.</Typography>
            </Box>
            <SearchQuotaSummary quota={search.quota} loading={search.quotaLoading}
              registered={registered} canRefine={Boolean(response && search.lastPayload)} />
            <Box component="form" onSubmit={submit}>
              <Box component="fieldset" disabled={busy} sx={fieldsetSx}>
                <Stack spacing={1.5}>
                  <Typography component="label" htmlFor="clothing-description" sx={{ fontWeight: 700 }}>
                    What are you looking for?
                  </Typography>
                  <TextField id="clothing-description" fullWidth
                    placeholder="For example: an oversized black denim jacket"
                    value={query} onChange={(event) => setQuery(event.target.value)}
                    inputProps={{ maxLength: 250, "aria-describedby": "search-description-help" }}
                    sx={{ "& .MuiOutlinedInput-root": { minHeight: 60 } }} />
                  <Typography id="search-description-help" variant="body2" color="text.secondary">
                    {exhausted ? "Your new-search allowance is used up. Existing results are still available."
                      : "Start a new search, or use filters to refine your existing results."}
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                    <Button type="submit" variant="contained" disabled={busy || exhausted || !query.trim()}
                      sx={{ minWidth: 150 }}>
                      {busy ? "Searching…" : exhausted ? "No searches left" : "New search"}
                    </Button>
                    <Button variant="outlined" onClick={() => setDrawerOpen(true)} disabled={busy}>
                      Filters ({getActiveFilterCount(filters)})
                    </Button>
                    {registered && (
                      <Button variant="outlined" disabled={busy || saving || !response}
                        onClick={saveCurrentSearch}>{saving ? "Saving…" : "Save search"}</Button>
                    )}
                    <Button disabled={busy} onClick={() => { void search.refreshQuota(); }}>Refresh allowance</Button>
                  </Stack>
                  {registered && (
                    <FormControlLabel label="Show all genders" control={
                      <Switch checked={allGenders} disabled={busy} onChange={(event) => {
                        const next = event.target.checked;
                        setAllGenders(next);
                        void refine({ onboardingGender: next ? "" : (profile?.onboarding?.gender || "") });
                      }} />
                    } />
                  )}
                </Stack>
              </Box>
            </Box>
            {search.error && (
              <Alert severity="error" action={search.lastPayload ? (
                <Button color="inherit" disabled={busy} onClick={() => { void search.retry(); }}>Retry</Button>
              ) : null}>{searchErrorMessage(search.error)}</Alert>
            )}
            {notice && <Alert onClose={() => setNotice("")}>{notice}</Alert>}
            {search.hasSearched && (
              <Box component="fieldset" disabled={busy} sx={fieldsetSx}>
                <SearchSortBar value={sort} onChange={(next) => {
                  setSort(next);
                  void refine({ sort: next });
                }} total={response?.total || 0} visibleCount={response?.results?.length || 0}
                  viewMode={viewMode} onViewChange={setViewMode} />
              </Box>
            )}
            <Box sx={{ pointerEvents: busy ? "none" : "auto" }}>
              <SearchResults results={response?.results || []} isLoading={busy}
                hasSearched={search.hasSearched} query={search.responsePayload?.query || ""}
                suggestions={["Try a broader description", "Remove a filter"]}
                onSaveItem={registered ? saveProduct : null} userId={registered ? user.uid : undefined}
                viewMode={viewMode} filters={visibleFilters}
                onRemoveFilter={removeFilter} onClearAllFilters={clearFilters} />
            </Box>
            {response?.hasMore && (
              <Button variant="outlined" disabled={busy} onClick={() => {
                void refine({ page: (response.page || 1) + 1 }, true);
              }} sx={{ alignSelf: "center", minWidth: 160 }}>Load more</Button>
            )}
            {!!response?.warnings?.length && <Alert severity="info">{response.warnings.join(" ")}</Alert>}
          </Stack>
        </Container>
        <FilterDrawer open={drawerOpen && !busy} onClose={() => setDrawerOpen(false)} filters={filters}
          onToggleFilter={(key, value) => setFilters((previous) => toggleFilterValue(previous, key, value))}
          onPriceChange={(key, value) => setFilters((previous) => setPriceFilterValue(previous, key, value))}
          onClearGroup={(key) => setFilters((previous) => clearFilterGroup(previous, key))}
          onClearAll={() => setFilters(clearAllFilters())}
          onApply={() => { setDrawerOpen(false); return refine({ filters }); }} />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
