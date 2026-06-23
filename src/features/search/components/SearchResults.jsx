import React from "react";
import { Box, Button, Chip, Grid, Stack, Typography } from "@mui/material";
import SearchResultCard from "./SearchResultCard";
import SearchEmptyState from "./SearchEmptyState";
import SearchResultsSkeleton from "./SearchResultsSkeleton";
import { colors } from "../../../shared/ui/theme/designTokens";

const FILTER_LABELS = {
  gender: "Gender",
  category: "Category",
  size: "Size",
  color: "Color",
  brand: "Brand",
  store: "Store",
  availability: "Availability",
  priceMin: "Min price",
  priceMax: "Max price",
};

const buildFilterChips = (filters, onRemoveFilter) => {
  if (!filters) return [];

  const chips = [];

  Object.entries(filters).forEach(([key, value]) => {
    const labelKey = FILTER_LABELS[key] || key;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        chips.push({
          key,
          value: item,
          label: `${labelKey}: ${item}`,
        });
      });
      return;
    }

    if (value !== "" && value !== null && value !== undefined) {
      chips.push({
        key,
        value,
        label: `${labelKey}: ${value}`,
      });
    }
  });

  return chips.map((chip) => (
    <Chip
      key={`${chip.key}-${chip.value}`}
      label={chip.label}
      onDelete={
        onRemoveFilter ? () => onRemoveFilter(chip.key, chip.value) : undefined
      }
      sx={{
        bgcolor: colors.surface2,
        color: colors.textPrimary,
        border: `1px solid ${colors.border}`,
        height: 34,
        "& .MuiChip-deleteIcon": {
          color: colors.textMuted,
        },
        "& .MuiChip-deleteIcon:hover": {
          color: colors.accent,
        },
      }}
    />
  ));
};

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
  const activeFilterChips = buildFilterChips(filters, onRemoveFilter);
  const hasResults = results.length > 0;

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Typography
          sx={{
            color: colors.textPrimary,
            mb: 2.5,
            fontWeight: 800,
            fontSize: "1.15rem",
          }}
        >
          Finding matching pieces...
        </Typography>
        <SearchResultsSkeleton viewMode={viewMode} />
      </Box>
    );
  }

  if (!hasResults) {
    return (
      <SearchEmptyState
        hasSearched={hasSearched}
        query={query}
        activeFilterCount={activeFilterChips.length}
        suggestions={suggestions}
        onClearAllFilters={onClearAllFilters}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", lg: "center" }}
        spacing={1.5}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: "1.15rem",
            }}
          >
            {results.length} result{results.length === 1 ? "" : "s"}
            {query ? ` for "${query}"` : ""}
          </Typography>

          {activeFilterChips.length > 0 ? (
            <Typography
              sx={{ color: colors.textMuted, mt: 0.5, fontSize: "0.94rem" }}
            >
              Narrowed by {activeFilterChips.length} active filter
              {activeFilterChips.length === 1 ? "" : "s"}.
            </Typography>
          ) : null}
        </Box>

        {activeFilterChips.length > 0 ? (
          <Button
            onClick={onClearAllFilters}
            sx={{
              color: colors.accent,
              fontWeight: 800,
              textTransform: "none",
              px: 0,
              minWidth: "auto",
            }}
          >
            Clear all filters
          </Button>
        ) : null}
      </Stack>

      {activeFilterChips.length > 0 ? (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {activeFilterChips}
        </Stack>
      ) : null}

      <Grid container spacing={3}>
        {results.map((result, index) => (
          <Grid
            item
            key={
              result.itemId ||
              result.productUrl ||
              result.name ||
              `item-${index}`
            }
            xs={12}
            sm={viewMode === "list" ? 12 : 6}
            lg={viewMode === "list" ? 12 : 4}
            sx={{ display: "flex" }}
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
    </Box>
  );
}

export default SearchResults;
