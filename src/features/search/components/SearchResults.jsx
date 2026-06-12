import { Box, Chip, Grid, Skeleton, Stack, Typography } from "@mui/material";
import SearchResultCard from "./SearchResultCard";
import SearchEmptyState from "./SearchEmptyState";

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

const buildFilterChips = ({ filters, onRemoveFilter }) => {
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
          onDelete: onRemoveFilter
            ? () => onRemoveFilter(key, item)
            : undefined,
        });
      });
      return;
    }

    if (value !== "" && value !== null && value !== undefined) {
      chips.push({
        key,
        value,
        label: `${labelKey}: ${value}`,
        onDelete: onRemoveFilter ? () => onRemoveFilter(key, value) : undefined,
      });
    }
  });

  return chips;
};

function SearchResults({
  results = [],
  isLoading = false,
  hasSearched = false,
  query = "",
  suggestions = [],
  onSaveItem,
  viewMode = "grid",
  userId,
  filters,
  onRemoveFilter,
  onClearAllFilters,
}) {
  const activeFilterChips = buildFilterChips({ filters, onRemoveFilter });
  const hasResults = results.length > 0;
  const skeletonCount = viewMode === "list" ? 4 : 8;

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h6"
          sx={{ color: "white", mb: 2, fontWeight: 700 }}
        >
          Finding matching pieces...
        </Typography>

        <Grid container spacing={2.5}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Grid
              key={index}
              item
              xs={12}
              sm={viewMode === "list" ? 12 : 6}
              md={viewMode === "list" ? 12 : 4}
              lg={viewMode === "list" ? 12 : 3}
            >
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  height={280}
                  animation="wave"
                  sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
                />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="38%" height={28} animation="wave" />
                  <Skeleton width="85%" height={32} animation="wave" />
                  <Skeleton width="52%" height={24} animation="wave" />
                  <Skeleton width="34%" height={30} animation="wave" />
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Skeleton width={70} height={28} animation="wave" />
                    <Skeleton width={90} height={28} animation="wave" />
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
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
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
          {results.length} result{results.length === 1 ? "" : "s"}
          {query ? ` for “${query}”` : ""}
        </Typography>

        {activeFilterChips.length > 0 && (
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.68)" }}>
            Narrowed by {activeFilterChips.length} active filter
            {activeFilterChips.length === 1 ? "" : "s"}
          </Typography>
        )}
      </Stack>

      {activeFilterChips.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {activeFilterChips.map((chip) => (
            <Chip
              key={`${chip.key}-${chip.value}`}
              label={chip.label}
              onDelete={chip.onDelete}
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.12)",
                "& .MuiChip-deleteIcon": {
                  color: "rgba(255,255,255,0.62)",
                  "&:hover": {
                    color: "#59e6db",
                  },
                },
              }}
            />
          ))}
        </Stack>
      )}

      <Grid container spacing={2.5}>
        {results.map((result, index) => (
          <Grid
            item
            key={
              result.itemId || result.productUrl || `${result.name}-${index}`
            }
            xs={12}
            sm={viewMode === "list" ? 12 : 6}
            md={viewMode === "list" ? 12 : 4}
            lg={viewMode === "list" ? 12 : 3}
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
