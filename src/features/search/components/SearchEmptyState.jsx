import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const defaultSuggestions = [
  "Try a broader clothing term",
  "Remove one or two filters",
  "Search by color, item type, or occasion",
];

function SearchEmptyState({
  hasSearched = false,
  query = "",
  activeFilterCount = 0,
  suggestions = defaultSuggestions,
  onClearAllFilters,
}) {
  const isFilteredEmpty = activeFilterCount > 0;

  const title = !hasSearched
    ? "Start with a style description"
    : isFilteredEmpty
      ? "No results match these filters"
      : "No results found";

  const description = !hasSearched
    ? "Describe what you want to wear, then we’ll gather matching items across sources."
    : isFilteredEmpty
      ? `We couldn’t find items for “${query}” with the current filters. Try clearing a few filters or broadening the description.`
      : `We couldn’t find matches for “${query}”. Try a simpler phrase, another clothing term, or a broader style description.`;

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 3,
        border: "1px dashed rgba(255,255,255,0.15)",
        bgcolor: "rgba(255,255,255,0.03)",
        color: "white",
        px: { xs: 3, sm: 5 },
        py: { xs: 5, sm: 7 },
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          mx: "auto",
          mb: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(64,224,208,0.12)",
          color: "turquoise",
        }}
      >
        <SearchOffIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "rgba(255,255,255,0.72)",
          maxWidth: 620,
          mx: "auto",
          mb: 3,
        }}
      >
        {description}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
        sx={{ mb: 3 }}
      >
        {suggestions.map((suggestion, index) => (
          <Chip
            key={`${suggestion}-${index}`}
            icon={<AutoAwesomeIcon />}
            label={suggestion}
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.14)",
              bgcolor: "rgba(255,255,255,0.04)",
            }}
            variant="outlined"
          />
        ))}
      </Stack>

      {isFilteredEmpty && onClearAllFilters && (
        <Button
          variant="contained"
          startIcon={<RestartAltIcon />}
          onClick={onClearAllFilters}
          sx={{
            bgcolor: "turquoise",
            color: "black",
            fontWeight: 700,
            "&:hover": { bgcolor: "darkturquoise" },
          }}
        >
          Clear all filters
        </Button>
      )}
    </Box>
  );
}

export default SearchEmptyState;
