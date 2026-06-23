import React from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "priceasc", label: "Price: Low to High" },
  { value: "pricedesc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function SearchSortBar({
  value = "relevance",
  onChange,
  total = 0,
  visibleCount = 0,
  viewMode = "grid",
  onViewChange,
}) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", lg: "center" }}
      justifyContent="space-between"
      sx={{ width: "100%" }}
    >
      <Box>
        <Typography sx={{ color: colors.textPrimary, fontWeight: 750 }}>
          {visibleCount} of {total} result{total === 1 ? "" : "s"}
        </Typography>
        <Typography
          sx={{ color: colors.textMuted, mt: 0.4, fontSize: "0.92rem" }}
        >
          Refine results, switch layouts, and keep exploring.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 240 } }}>
          <Select
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            displayEmpty
            sx={{
              color: colors.textPrimary,
              borderRadius: radius.md,
              bgcolor: colors.surfaceSoft,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.border,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.accent,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.accent,
              },
              "& .MuiSvgIcon-root": {
                color: colors.textPrimary,
              },
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={(event, nextView) => {
            if (nextView) onViewChange?.(nextView);
          }}
          aria-label="Search result view"
          sx={{
            "& .MuiToggleButton-root": {
              minHeight: 42,
              px: 1.5,
              borderColor: colors.border,
              color: colors.textSecondary,
              bgcolor: colors.surfaceSoft,
              "&.Mui-selected": {
                color: colors.accent,
                bgcolor: colors.accentSoft,
                borderColor: colors.accentBorder,
              },
            },
          }}
        >
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="grid" aria-label="Grid view">
            <ViewModuleIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}

export const SEARCH_SORT_OPTIONS = SORT_OPTIONS;
export default SearchSortBar;
