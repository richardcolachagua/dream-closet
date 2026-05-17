import { Box, Chip, Button, Typography } from "@mui/material";
import { buildFilterChips } from "../utils/filterHelpers";

const FILTER_LABELS = {
  gender: "Gender",
  category: "Category",
  size: "Size",
  color: "Color",
  brand: "Brand",
  store: "Store",
  availability: "Availability",
  price: "Price",
};

function formatChipLabel(chip) {
  const groupLabel = FILTER_LABELS[chip.key] || chip.key;
  return `${groupLabel}: ${chip.label}`;
}

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
        width: "100%",
        mb: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "white",
            fontWeight: "bold",
            mr: 0.5,
          }}
        >
          Active filters
        </Typography>

        {typeof resultCount === "number" && (
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255,255,255,0.7)",
              mr: 1,
            }}
          >
            ({resultCount} results)
          </Typography>
        )}

        <Button
          size="small"
          onClick={onClearAll}
          sx={{
            color: "turquoise",
            textTransform: "none",
            fontWeight: "bold",
            minWidth: "auto",
            px: 1,
          }}
        >
          Clear all
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {chips.map((chip) => (
          <Chip
            key={`${chip.key}-${chip.value}`}
            label={formatChipLabel(chip)}
            onDelete={() => onRemoveFilter(chip.key, chip.value)}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.14)",
              fontWeight: 500,
              "& .MuiChip-deleteIcon": {
                color: "rgba(255,255,255,0.8)",
                "&:hover": {
                  color: "turquoise",
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default AppliedFiltersChips;
