import {
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import FilterSection from "./FilterSection";
import PriceRangeFilter from "./PriceRangeFilter";
import ColorFilterGroup from "./ColorFilterGroup";
import { FILTER_OPTIONS } from "../../search/utils/filterOptions";

const checkboxSx = {
  color: "turquoise",
  "&.Mui-checked": {
    color: "turquoise",
  },
};

function SearchFiltersPanel({
  filters,
  onToggleFilter,
  onPriceChange,
  onClearGroup,
  onClearAll,
  showActions = true,
  onApply,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", sm: 360 },
        bgcolor: "#111",
        color: "white",
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.12)",
        p: 2,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
          }}
        >
          Filters
        </Typography>

        <Button
          onClick={onClearAll}
          size="small"
          sx={{
            color: "turquoise",
            fontWeight: "bold",
            textTransform: "none",
          }}
        >
          Clear all
        </Button>
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 2 }} />

      <FilterSection
        title="Gender"
        onClear={() => onClearGroup("gender")}
        hasActiveValues={filters.gender.length > 0}
        defaultExpanded
      >
        <FormGroup>
          {FILTER_OPTIONS.gender.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.gender.includes(option.value)}
                  onChange={() => onToggleFilter("gender", option.value)}
                  sx={checkboxSx}
                />
              }
              label={option.label}
              sx={{ color: "white" }}
            />
          ))}
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Category"
        onClear={() => onClearGroup("category")}
        hasActiveValues={filters.category.length > 0}
        defaultExpanded
      >
        <FormGroup>
          {FILTER_OPTIONS.category.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.category.includes(option.value)}
                  onChange={() => onToggleFilter("category", option.value)}
                  sx={checkboxSx}
                />
              }
              label={option.label}
              sx={{ color: "white" }}
            />
          ))}
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Size"
        onClear={() => onClearGroup("size")}
        hasActiveValues={filters.size.length > 0}
      >
        <FormGroup>
          {FILTER_OPTIONS.size.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.size.includes(option.value)}
                  onChange={() => onToggleFilter("size", option.value)}
                  sx={checkboxSx}
                />
              }
              label={option.label}
              sx={{ color: "white" }}
            />
          ))}
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Color"
        onClear={() => onClearGroup("color")}
        hasActiveValues={filters.color.length > 0}
      >
        <ColorFilterGroup
          options={FILTER_OPTIONS.color}
          selectedColors={filters.color}
          onToggleColor={(colorValue) => onToggleFilter("color", colorValue)}
        />
      </FilterSection>

      <FilterSection
        title="Price"
        onClear={() => onClearGroup("price")}
        hasActiveValues={filters.priceMin !== "" || filters.priceMax !== ""}
      >
        <PriceRangeFilter
          priceMin={filters.priceMin}
          priceMax={filters.priceMax}
          onPriceChange={onPriceChange}
        />
      </FilterSection>

      <FilterSection
        title="Store"
        onClear={() => onClearGroup("store")}
        hasActiveValues={filters.store.length > 0}
      >
        <FormGroup>
          {FILTER_OPTIONS.store.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.store.includes(option.value)}
                  onChange={() => onToggleFilter("store", option.value)}
                  sx={checkboxSx}
                />
              }
              label={option.label}
              sx={{ color: "white" }}
            />
          ))}
        </FormGroup>
      </FilterSection>

      <FilterSection
        title="Brand"
        onClear={() => onClearGroup("brand")}
        hasActiveValues={filters.brand.length > 0}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Type a brand and press Enter"
          variant="outlined"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const value = event.target.value.trim();

              if (value && !filters.brand.includes(value)) {
                onToggleFilter("brand", value);
                event.target.value = "";
              }
            }
          }}
          sx={{
            input: { color: "white" },
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.2)",
              },
              "&:hover fieldset": {
                borderColor: "turquoise",
              },
              "&.Mui-focused fieldset": {
                borderColor: "turquoise",
              },
            },
          }}
        />
      </FilterSection>

      <FilterSection
        title="Availability"
        onClear={() => onClearGroup("availability")}
        hasActiveValues={filters.availability.length > 0}
      >
        <FormGroup>
          {FILTER_OPTIONS.availability.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  checked={filters.availability.includes(option.value)}
                  onChange={() => onToggleFilter("availability", option.value)}
                  sx={checkboxSx}
                />
              }
              label={option.label}
              sx={{ color: "white" }}
            />
          ))}
        </FormGroup>
      </FilterSection>

      {showActions && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClearAll}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
              }}
            >
              Reset filters
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={onApply}
              sx={{
                bgcolor: "turquoise",
                color: "black",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "darkturquoise",
                },
              }}
            >
              Apply filters
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

export default SearchFiltersPanel;
