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
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
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
  const safeVisibleCount = Number.isFinite(visibleCount) ? visibleCount : 0;
  const safeTotal = Number.isFinite(total) ? total : 0;

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", md: "center" }}
      sx={{
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surfaceSoft,
        borderRadius: radius.lg,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.25 },
      }}
    >
      <Box>
        <Typography
          sx={{
            color: colors.textPrimary,
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          {safeVisibleCount} of {safeTotal} result{safeTotal === 1 ? "" : "s"}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: colors.textSecondary,
            fontSize: "0.95rem",
          }}
        >
          Refine results, switch layouts, and keep exploring.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 210 } }}>
          <Select
            value={value}
            onChange={(event) => onChange?.(event.target.value)}
            displayEmpty
            sx={{
              color: colors.textPrimary,
              borderRadius: radius.md,
              bgcolor: colors.surface2,
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
          value={viewMode}
          exclusive
          onChange={(_, nextView) => {
            if (nextView) onViewChange?.(nextView);
          }}
          aria-label="Search result view"
          sx={{
            "& .MuiToggleButton-root": {
              minHeight: 42,
              px: 1.5,
              borderColor: colors.border,
              color: colors.textSecondary,
              bgcolor: colors.surface2,
              "&.Mui-selected": {
                color: colors.accent,
                bgcolor: colors.accentSoft,
                borderColor: colors.accentBorder,
              },
            },
          }}
        >
          <ToggleButton value="grid" aria-label="Grid view">
            <ViewModuleIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Stack>
  );
}

export const SEARCH_SORT_OPTIONS = SORT_OPTIONS;
export default SearchSortBar;
