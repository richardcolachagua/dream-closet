import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
];

function SearchSortControls({ value = "relevance", onChange, total = 0 }) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", md: "center" },
        flexDirection: { xs: "column", md: "row" },
        gap: 1.5,
        mb: 2,
      }}
    >
      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.72)" }}>
        {total} result{total === 1 ? "" : "s"}
      </Typography>

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel sx={{ color: "rgba(255,255,255,0.72)" }}>
          Sort by
        </InputLabel>
        <Select
          value={value}
          label="Sort by"
          onChange={(event) => onChange?.(event.target.value)}
          sx={{
            color: "white",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.2)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "turquoise",
            },
            ".MuiSvgIcon-root": {
              color: "white",
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
    </Box>
  );
}

export const SEARCH_SORT_OPTIONS = SORT_OPTIONS;
export default SearchSortControls;
