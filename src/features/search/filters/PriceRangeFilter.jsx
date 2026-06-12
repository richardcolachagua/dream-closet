import { Box, TextField, Typography } from "@mui/material";

function PriceRangeFilter({ priceMin, priceMax, onPriceChange }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.75)",
        }}
      >
        Enter a minimum and/or maximum price.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <TextField
          label="Min"
          type="number"
          size="small"
          variant="outlined"
          value={priceMin}
          onChange={(event) => onPriceChange("priceMin", event.target.value)}
          inputProps={{ min: 0, step: 1 }}
          sx={{
            input: { color: "white" },
            label: { color: "rgba(255,255,255,0.7)" },
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

        <TextField
          label="Max"
          type="number"
          size="small"
          variant="outlined"
          value={priceMax}
          onChange={(event) => onPriceChange("priceMax", event.target.value)}
          inputProps={{ min: 0, step: 1 }}
          sx={{
            input: { color: "white" },
            label: { color: "rgba(255,255,255,0.7)" },
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
      </Box>
    </Box>
  );
}

export default PriceRangeFilter;
