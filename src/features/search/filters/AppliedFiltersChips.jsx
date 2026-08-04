import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import { buildFilterChips, formatChipLabel } from "../utils/filterHelpers";

function AppliedFiltersChips({
  filters,
  onRemoveFilter,
  onClearAll,
  resultCount,
}) {
  const chips = buildFilterChips(filters);

  if (!chips.length) return null;

  return (
    <Box
      sx={{
        border: `1px solid ${colors.border}`,
        bgcolor: colors.surfaceSoft,
        borderRadius: radius.lg,
        px: { xs: 2, sm: 2.5 },
        py: { xs: 2, sm: 2.25 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: "0.98rem",
            }}
          >
            Active filters
          </Typography>

          {typeof resultCount === "number" ? (
            <Typography
              sx={{
                mt: 0.35,
                color: colors.textSecondary,
                fontSize: "0.9rem",
              }}
            >
              Narrowing {resultCount} result{resultCount === 1 ? "" : "s"}
            </Typography>
          ) : null}
        </Box>

        <Button
          onClick={onClearAll}
          sx={{
            color: colors.accent,
            fontWeight: 700,
            textTransform: "none",
            minWidth: "auto",
            px: 0,
            "&:hover": {
              bgcolor: "transparent",
              opacity: 0.9,
            },
          }}
        >
          Clear all
        </Button>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {chips.map((chip) => (
          <Chip
            key={`${chip.key}-${chip.value}`}
            label={formatChipLabel(chip)}
            onDelete={
              onRemoveFilter
                ? () => onRemoveFilter(chip.key, chip.value)
                : undefined
            }
            sx={{
              bgcolor: colors.surface2,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`,
              fontWeight: 600,
              height: 34,
              "& .MuiChip-deleteIcon": {
                color: colors.textMuted,
              },
              "& .MuiChip-deleteIcon:hover": {
                color: colors.accent,
              },
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

export default AppliedFiltersChips;
