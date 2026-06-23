import React, { useMemo } from "react";
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import { colors } from "../../../shared/ui/theme/designTokens";
import { interactiveCardSx } from "../../../shared/ui/theme/componentStyles";

const SORT_LABELS = {
  relevance: "Relevance",
  priceasc: "Price low to high",
  pricedesc: "Price high to low",
  newest: "Newest",
};

const FILTER_LABELS = {
  gender: "Gender",
  category: "Category",
  size: "Size",
  color: "Color",
  brand: "Brand",
  store: "Store",
  availability: "Availability",
  priceMin: "Min",
  priceMax: "Max",
};

const formatFilterLabel = (key, value) => {
  if (key === "priceMin") return `Min ${value}`;
  if (key === "priceMax") return `Max ${value}`;
  return `${FILTER_LABELS[key] || key}: ${value}`;
};

const getFilterChips = (filters = {}) => {
  const chips = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((item) => {
        chips.push({
          key: `${key}-${item}`,
          label: formatFilterLabel(key, item),
        });
      });
      return;
    }

    if (value !== "" && value !== null && value !== undefined) {
      chips.push({ key, label: formatFilterLabel(key, value) });
    }
  });

  return chips;
};

function SavedSearchCard({
  query,
  date,
  filters = {},
  sort = "relevance",
  page = 1,
  onDelete,
  onClick,
  selected,
  onSelect,
}) {
  const filterChips = useMemo(() => getFilterChips(filters), [filters]);
  const visibleChips = filterChips.slice(0, 3);
  const remainingChipCount = Math.max(
    filterChips.length - visibleChips.length,
    0,
  );

  return (
    <Box
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`Saved search ${query}`}
      sx={{
        ...interactiveCardSx,
        height: "100%",
        cursor: "pointer",
        border: selected
          ? `1px solid ${colors.accent}`
          : interactiveCardSx.border,
        boxShadow: selected
          ? "0 0 0 1px rgba(89,230,219,0.26), 0 14px 32px rgba(0,0,0,0.22)"
          : interactiveCardSx.boxShadow,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: colors.accentSoft,
              color: colors.accent,
              flexShrink: 0,
            }}
          >
            <SearchIcon />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 800,
                fontSize: "1.04rem",
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {query}
            </Typography>

            <Typography
              sx={{ color: colors.textMuted, mt: 0.65, fontSize: "0.92rem" }}
            >
              {date ? `Saved ${date}` : "Saved search"}
            </Typography>
          </Box>

          {typeof onSelect === "function" ? (
            <Checkbox
              checked={!!selected}
              onChange={(event) => {
                event.stopPropagation();
                onSelect();
              }}
              sx={{
                color: colors.textMuted,
                "&.Mui-checked": { color: colors.accent },
              }}
              inputProps={{ "aria-label": `Select search ${query}` }}
            />
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            label={`Sort: ${SORT_LABELS[sort] || sort}`}
            sx={{
              bgcolor: colors.accentSoft,
              color: colors.accent,
              border: `1px solid ${colors.accentBorder}`,
            }}
          />
          <Chip
            size="small"
            label={`Page ${page}`}
            sx={{
              bgcolor: colors.surface2,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
            }}
          />
          {filterChips.length > 0 ? (
            <Chip
              size="small"
              label={`${filterChips.length} filter${filterChips.length === 1 ? "" : "s"}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.04)",
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
              }}
            />
          ) : null}
        </Stack>

        {filterChips.length > 0 ? (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {visibleChips.map((chip) => (
              <Chip
                key={chip.key}
                size="small"
                label={chip.label}
                sx={{
                  maxWidth: "100%",
                  bgcolor: colors.surface2,
                  color: colors.textSecondary,
                  border: `1px solid ${colors.border}`,
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            ))}
            {remainingChipCount > 0 ? (
              <Chip
                size="small"
                label={`+${remainingChipCount} more`}
                sx={{
                  bgcolor: colors.surface2,
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                }}
              />
            ) : null}
          </Stack>
        ) : null}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            pt: 1,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Stack direction="row" spacing={0.75} alignItems="center">
            <ArrowOutwardIcon sx={{ color: colors.accent, fontSize: 18 }} />
            <Typography
              sx={{ color: colors.textSecondary, fontSize: "0.9rem" }}
            >
              Run this search again
            </Typography>
          </Stack>

          <Tooltip title="Delete saved search">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              aria-label="Delete saved search"
              sx={{
                color: colors.textMuted,
                border: `1px solid ${colors.border}`,
                "&:hover": {
                  color: colors.danger,
                  borderColor: "rgba(255,127,150,0.35)",
                  bgcolor: "rgba(255,127,150,0.08)",
                },
              }}
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default SavedSearchCard;
