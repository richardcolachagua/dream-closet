import React from "react";
import { Grid, Stack, Typography } from "@mui/material";
import SearchResultCard from "./SearchResultCard";
import SearchEmptyState from "./SearchEmptyState";
import SearchResultsSkeleton from "./SearchResultsSkeleton";
import AppliedFiltersChips from "./AppliedFiltersChips";
import { colors } from "../../../shared/ui/theme/designTokens";
import { getActiveFilterCount } from "../utils/filterHelpers";

function SearchResults({
  results = [],
  isLoading = false,
  hasSearched = false,
  query = "",
  suggestions,
  onSaveItem,
  viewMode = "grid",
  userId,
  filters,
  onRemoveFilter,
  onClearAllFilters,
}) {
  const hasResults = results.length > 0;
  const activeFilterCount = getActiveFilterCount(filters);

  if (isLoading && !hasResults) {
    return <SearchResultsSkeleton viewMode={viewMode} />;
  }

  if (!hasResults) {
    return (
      <SearchEmptyState
        hasSearched={hasSearched}
        query={query}
        activeFilterCount={activeFilterCount}
        suggestions={suggestions}
        onClearAllFilters={onClearAllFilters}
      />
    );
  }

  return (
    <Stack spacing={2.25}>
      <Stack spacing={0.75}>
        <Typography
          sx={{
            color: colors.textPrimary,
            fontWeight: 800,
            fontSize: "1.05rem",
          }}
        >
          {results.length} result{results.length === 1 ? "" : "s"}
          {query ? ` for "${query}"` : ""}
        </Typography>

        <Typography
          sx={{
            color: colors.textSecondary,
            fontSize: "0.95rem",
          }}
        >
          Review the best-matching pieces, compare retailers, and save anything
          worth revisiting.
        </Typography>
      </Stack>

      <AppliedFiltersChips
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAllFilters}
        resultCount={results.length}
      />

      <Grid container spacing={2.5}>
        {results.map((result, index) => (
          <Grid
            item
            xs={12}
            sm={viewMode === "list" ? 12 : 6}
            lg={viewMode === "list" ? 12 : 4}
            xl={viewMode === "list" ? 12 : 3}
            key={
              result?.itemId || result?.productUrl || `${result?.name}-${index}`
            }
          >
            <SearchResultCard
              result={result}
              viewMode={viewMode}
              onSaveItem={onSaveItem}
              userId={userId}
            />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default SearchResults;
