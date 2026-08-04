import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
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
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surfaceSoft,
        borderRadius: radius.lg,
        px: { xs: 2.5, sm: 4 },
        py: { xs: 4, sm: 5 },
        textAlign: "center",
      }}
    >
      <Stack spacing={2.2} alignItems="center">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: colors.accentSoft,
            color: colors.accent,
            border: `1px solid ${colors.accentBorder}`,
          }}
        >
          <SearchOffIcon sx={{ fontSize: 30 }} />
        </Box>

        <Stack spacing={1} alignItems="center">
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: "1.3rem",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: colors.textSecondary,
              maxWidth: 640,
              lineHeight: 1.75,
              fontSize: "0.98rem",
            }}
          >
            {description}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
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
                "& .MuiChip-icon": {
                  color: colors.accent,
                },
              }}
            />
          ))}
        </Stack>

        {isFilteredEmpty && onClearAllFilters ? (
          <Button
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
