import { useEffect, useRef, useState } from "react";
import {
  Alert, Box, Button, Container, CssBaseline, FormControlLabel,
  Stack, Switch, TextField, Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import PublicHeader from "../../../shared/ui/navigation/PublicHeader";
import SearchPageHeader from "../../../shared/ui/navigation/SearchPageHeader";
import Footer from "../../../shared/ui/navigation/Footer";
import { colors, layout } from "../../../shared/ui/theme/designTokens";
import { ROUTES } from "../../../app/routes/routePaths";
import SearchResults from "./SearchResults";
import SearchSortBar from "./SearchSortBar";
import FilterDrawer from "../filters/FilterDrawer";
import {
  toggleFilterValue, setPriceFilterValue, clearFilterGroup,
  clearAllFilters, removeFilterValue, getActiveFilterCount,
} from "../utils/filterHelpers";
import { parseSearchState, buildSearchStateQuery } from "../utils/searchStateHelpers";
import { searchIdentity } from "../services/searchSession";
import { useCallableSearch, searchErrorMessage } from "../hooks/useCallableSearch";
import { saveItem, saveSearch } from "../../saved/savedDataService";

const theme = createTheme();

const quotaLabel = (quota) => {
  if (!quota) return "Search allowance unavailable.";
  if (quota.unlimited) return "Pro: unlimited searches. Request-rate limits still apply.";
  const name = quota.tier === "visitor" ? "Visitor" : "Free";
  return `${name}: ${quota.remaining} of ${quota.limit} new searches remaining.`;
};

const resetLabel = (quota) => {
  if (!quota?.resetAt) return "";
  const date = new Date(quota.resetAt);
  if (!Number.isFinite(date.getTime())) return "";
  if (quota.tier === "free") {
    return `Allowance resets at ${date.toLocaleString("en-US", {
      timeZone: "America/New_York",
      timeZoneName: "short",
    })}.`;
  }
  return `Next visitor slot becomes available at ${date.toLocaleString()}. Each search expires individually after 24 hours.`;
};

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
  const identity = searchIdentity(user);
  const search = useCallableSearch(identity);
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
      query: payload.query,
      filters: payload.filters,
      sort: payload.sort,
      page: payload.page,
    });
    navigate({ pathname: location.pathname, search: value ? `?${value}` : "" }, {
      replace: true,
    });
  };

  useEffect(() => {
    if (initialStarted.current) return;
    initialStarted.current = true;
    if (initial.query) {
      void search.submit({
        query: initial.query,
        filters: initial.filters,
        sort: initial.sort,
        page: initial.page,
        pageSize: 24,
        onboardingGender: profile?.onboarding?.gender || "",
      });
    }
  }, [initial, profile, search]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy || exhausted || !query.trim()) return;
    const payload = {
      query, filters, sort, page: 1, pageSize: 24,
      onboardingGender: gender,
    };
    const result = await search.submit(payload);
    if (alive.current && result) updateUrl(payload);
  };

  const refine = async (next = {}, append = false) => {
    if (!search.lastPayload || busy) return;
    const payload = {
      ...search.lastPayload,
      page: 1,
      ...next,
    };
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
    if (!registered || !search.lastPayload || saving) return;
    setSaving(true);
    try {
      const payload = search.responsePayload;
      await saveSearch(user.uid, {
        query: payload.query,
        filters: payload.filters,
        sort: payload.sort,
        page: payload.page,
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: colors.background,
        color: colors.textPrimary, display: "flex", flexDirection: "column" }}>
        {registered ? <SearchPageHeader /> : <PublicHeader />}
        <Container component="main" maxWidth={layout.pageMax}
          sx={{ flex: 1, py: 4 }}>
          <Stack spacing={3}>
            <Typography variant="h4">
              {registered ? "Find your next look" : "Try Dream Closet"}
            </Typography>
            <Box aria-live="polite">
              <Typography>
                {search.quotaLoading ? "Checking search allowance..." : quotaLabel(search.quota)}
              </Typography>
              <Typography variant="body2">{resetLabel(search.quota)}</Typography>
              <Typography variant="body2">
                Only a new text search uses an allowance. Sorting, filters,
                pagination, and retries reuse the current search session.
              </Typography>
            </Box>
            {!registered && (
              <Alert severity="info">
                Visitors get 3 searches in a rolling 24 hours. A registered Free
                account gets a separate allowance of 5 searches per New York
                calendar day. Unlimited daily searches require Pro.
                {" "}<Button component={RouterLink} to={ROUTES.SIGNUP}>Sign up</Button>
                <Button component={RouterLink} to={ROUTES.LOGIN}>Sign in</Button>
              </Alert>
            )}
            {search.quota?.remaining === 0 && !search.quota.unlimited && (
              <Alert severity="warning">
                No new searches remain. You can still refine the current search.
                {registered && <Button component={RouterLink} to={ROUTES.PRICING}>View Pro</Button>}
              </Alert>
            )}
            <Box component="form" onSubmit={submit}>
              <Box component="fieldset" disabled={busy}
                sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
                <Stack spacing={2}>
                  <TextField fullWidth label="Describe the clothing you want"
                    value={query} onChange={(event) => setQuery(event.target.value)}
                    inputProps={{ maxLength: 250 }}
                    sx={{ bgcolor: "white", borderRadius: 1 }} />
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Button type="submit" variant="contained" disabled={busy || exhausted || !query.trim()}>
                      {busy ? "Searching..." : "New search"}
                    </Button>
                    <Button onClick={() => setDrawerOpen(true)} disabled={busy}>
                      Filters ({getActiveFilterCount(filters)})
                    </Button>
                    {registered && (
                      <Button disabled={busy || saving || !response}
                        onClick={saveCurrentSearch}>
                        {saving ? "Saving..." : "Save current search"}
                      </Button>
                    )}
                    <Button disabled={busy} onClick={() => { void search.refreshQuota(); }}>
                      Refresh allowance
                    </Button>
                  </Stack>
                  {registered && (
                    <FormControlLabel label="Show all genders" control={
                      <Switch checked={allGenders} disabled={busy}
                        onChange={(event) => {
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
                <Button color="inherit" disabled={busy}
                  onClick={() => { void search.retry(); }}>Retry</Button>
              ) : null}>
                {searchErrorMessage(search.error)}
              </Alert>
            )}
            {notice && <Alert onClose={() => setNotice("")}>{notice}</Alert>}
            {search.hasSearched && (
              <Box component="fieldset" disabled={busy}
                sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
                <SearchSortBar value={sort}
                  onChange={(next) => {
                    setSort(next);
                    void refine({ sort: next });
                  }}
                  total={response?.total || 0}
                  visibleCount={response?.results?.length || 0}
                  viewMode={viewMode} onViewChange={setViewMode} />
              </Box>
            )}
            <Box sx={{ pointerEvents: busy ? "none" : "auto" }}>
              <SearchResults results={response?.results || []}
                isLoading={busy} hasSearched={search.hasSearched}
                query={search.responsePayload?.query || ""}
                suggestions={["Try a broader description", "Remove a filter"]}
                onSaveItem={registered ? saveProduct : null}
                userId={registered ? user.uid : undefined}
                viewMode={viewMode} filters={visibleFilters}
                onRemoveFilter={removeFilter} onClearAllFilters={clearFilters} />
            </Box>
            {response?.hasMore && (
              <Button disabled={busy} onClick={() => {
                void refine({ page: (response.page || 1) + 1 }, true);
              }}>Load more</Button>
            )}
            {!!response?.warnings?.length && (
              <Alert severity="info">{response.warnings.join(" ")}</Alert>
            )}
          </Stack>
        </Container>
        <FilterDrawer open={drawerOpen && !busy}
          onClose={() => setDrawerOpen(false)} filters={filters}
          onToggleFilter={(key, value) => setFilters((previous) => toggleFilterValue(previous, key, value))}
          onPriceChange={(key, value) => setFilters((previous) => setPriceFilterValue(previous, key, value))}
          onClearGroup={(key) => setFilters((previous) => clearFilterGroup(previous, key))}
          onClearAll={() => setFilters(clearAllFilters())}
          onApply={() => {
            setDrawerOpen(false);
            return refine({ filters });
          }} />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
