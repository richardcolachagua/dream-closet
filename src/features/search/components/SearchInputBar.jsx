import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

const EXAMPLES = [
  "oversized cream cardigan",
  "black satin midi dress",
  "men's navy wool overcoat",
];

function SearchInputBar({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
  value,
  onChange,
  onSearchSubmit,
  onOpenFilters,
  activeFilterCount = 0,
  saveDisabled = false,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const filterButtonLabel = useMemo(() => {
    return activeFilterCount > 0
      ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"}`
      : "Filters";
  }, [activeFilterCount]);

  const handleSubmit = async () => {
    if (!value || !value.trim()) {
      onSearchError?.("Please enter a description.");
      return;
    }

    onSearchStart?.();
    setIsLoading(true);

    try {
      const results = await onSearchSubmit?.(value.trim());
      onSearchResults?.(results);
    } catch (error) {
      onSearchError?.(
        error?.response?.status === 429
          ? "Too many requests. Please wait a moment."
          : "Error fetching results. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSearch = () => {
    if (saveDisabled || !onSaveSearch) return;

    if (!value || !value.trim()) {
      onSearchError?.("Cannot save an empty search.");
      return;
    }

    onSaveSearch(value.trim());
  };

  return (
    <Stack spacing={1.75} sx={{ width: "100%" }}>
      <Box
        sx={{
          p: { xs: 1.25, md: 1.5 },
          borderRadius: 4,
          border: `1px solid ${colors.border}`,
          bgcolor: colors.surface,
          boxShadow: "0 18px 44px rgba(0,0,0,0.18)",
        }}
      >
        <Stack spacing={1.25}>
          <TextField
            placeholder="Describe the piece you want to find..."
            variant="outlined"
            fullWidth
            value={value}
            onChange={onChange}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.textMuted }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 62,
                borderRadius: radius.lg,
                bgcolor: colors.surface2,
                color: colors.textPrimary,
                fontSize: "1rem",
                "& fieldset": {
                  borderColor: colors.border,
                },
                "&:hover fieldset": {
                  borderColor: colors.accent,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.accent,
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input::placeholder": {
                color: colors.textMuted,
                opacity: 1,
              },
            }}
          />

          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={1.1}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                icon={<AutoAwesomeIcon />}
                label="Natural language search"
                sx={{
                  color: colors.textPrimary,
                  bgcolor: colors.surface2,
                  border: `1px solid ${colors.border}`,
                }}
              />
              <Chip
                label={
                  activeFilterCount > 0
                    ? `${activeFilterCount} active filter${activeFilterCount === 1 ? "" : "s"}`
                    : "No filters applied"
                }
                sx={{
                  color:
                    activeFilterCount > 0
                      ? colors.accent
                      : colors.textSecondary,
                  bgcolor:
                    activeFilterCount > 0 ? colors.accentSoft : colors.surface2,
                  border: `1px solid ${activeFilterCount > 0 ? colors.accentBorder : colors.border}`,
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: { xs: "100%", lg: "auto" } }}
            >
              <Button
                variant="outlined"
                startIcon={<TuneIcon />}
                onClick={onOpenFilters}
                sx={{
                  ...secondaryButtonSx,
                  minHeight: 46,
                  width: { xs: "100%", sm: "auto" },
                  ...(activeFilterCount > 0
                    ? {
                        color: colors.accent,
                        borderColor: colors.accentBorder,
                        bgcolor: colors.accentSoft,
                      }
                    : {}),
                }}
              >
                {filterButtonLabel}
              </Button>

              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSubmit}
                disabled={isLoading}
                sx={{
                  ...primaryButtonSx,
                  minHeight: 46,
                  width: { xs: "100%", sm: "auto" },
                  minWidth: 130,
                }}
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>

              {!saveDisabled && onSaveSearch ? (
                <Button
                  variant="outlined"
                  startIcon={<BookmarkBorderIcon />}
                  onClick={handleSaveSearch}
                  disabled={isLoading}
                  sx={{
                    ...secondaryButtonSx,
                    minHeight: 46,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  Save search
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 0.5, md: 1 } }}>
        <Typography
          sx={{
            color: colors.textMuted,
            fontSize: "0.93rem",
            lineHeight: 1.7,
          }}
        >
          Try searches like{" "}
          <Box component="span" sx={{ color: colors.textPrimary }}>
            {EXAMPLES.join(", ")}
          </Box>
          .
        </Typography>
      </Box>
    </Stack>
  );
}

export default SearchInputBar;
