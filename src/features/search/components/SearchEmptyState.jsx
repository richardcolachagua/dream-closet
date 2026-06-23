import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { colors } from "../../../shared/ui/theme/designTokens";
import { primaryButtonSx } from "../../../shared/ui/theme/componentStyles";

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
    ? "Describe what you want to wear, and Dream Closet will surface matching pieces across available sources."
    : isFilteredEmpty
      ? `We couldn’t find items for "${query}" with the current filters. Try clearing a few filters or broadening the description.`
      : `We couldn’t find matches for "${query}". Try a simpler phrase, another clothing term, or a broader style description.`;

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 5,
        border: `1px dashed ${colors.borderStrong}`,
        bgcolor: colors.surfaceSoft,
        color: colors.textPrimary,
        px: { xs: 2.5, sm: 5 },
        py: { xs: 4.5, sm: 6.5 },
      }}
    >
      <Stack spacing={2.5} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: colors.accentSoft,
            color: colors.accent,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 34 }} />
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 850,
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              mb: 1,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: colors.textSecondary,
              maxWidth: 660,
              mx: "auto",
              lineHeight: 1.75,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="center"
        >
          {suggestions.map((suggestion, index) => (
            <Chip
              key={`${suggestion}-${index}`}
              icon={<AutoAwesomeIcon />}
              label={suggestion}
              sx={{
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.surface2,
              }}
            />
          ))}
        </Stack>

        {isFilteredEmpty && onClearAllFilters ? (
          <Button
            variant="contained"
            startIcon={<RestartAltIcon />}
            onClick={onClearAllFilters}
            sx={primaryButtonSx}
          >
            Clear all filters
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}

export default SearchEmptyState;
