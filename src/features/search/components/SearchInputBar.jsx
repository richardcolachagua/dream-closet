import { useState } from "react";
import { TextField, Button, Box, InputAdornment } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import SaveSearchButton from "../../../shared/ui/buttons/SaveButton";

function UserDescriptionInput({
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

  const handleSubmit = async () => {
    if (!value || value.trim() === "") {
      onSearchError("Please enter a description.");
      return;
    }

    onSearchStart();
    setIsLoading(true);

    try {
      const results = await onSearchSubmit(value);
      onSearchResults(results);
    } catch (error) {
      onSearchError(
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

    if (!value || value.trim() === "") {
      onSearchError("Cannot save empty search");
      return;
    }

    onSaveSearch(value);
  };

  const filterButtonLabel =
    activeFilterCount > 0 ? `Filters (${activeFilterCount})` : "Filters";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        mb: 3,
        width: "100%",
        gap: 1.5,
      }}
    >
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(0,0,0,0.45)" }} />
            </InputAdornment>
          ),
          disableUnderline: true,
        }}
        sx={{
          width: "100%",
          "& .MuiFilledInput-root": {
            minHeight: 56,
            borderRadius: 3,
            backgroundColor: "white",
            "&:hover": {
              backgroundColor: "white",
            },
            "&.Mui-focused": {
              backgroundColor: "white",
            },
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          width: "100%",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={onOpenFilters}
          sx={{
            minHeight: 44,
            px: 2,
            borderRadius: 2,
            borderColor: "turquoise",
            color: "turquoise",
            fontWeight: 700,
            textTransform: "none",
            width: { xs: "100%", sm: "auto" },
            "&:hover": {
              borderColor: "#35d8cb",
              backgroundColor: "rgba(64,224,208,0.05)",
            },
          }}
        >
          {filterButtonLabel}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={<SearchIcon />}
          sx={{
            minHeight: 44,
            px: 2.5,
            borderRadius: 2,
            bgcolor: "turquoise",
            color: "black",
            fontWeight: 700,
            fontSize: "0.95rem",
            textTransform: "none",
            boxShadow: "none",
            width: { xs: "100%", sm: "auto" },
            "&:hover": { bgcolor: "#35d8cb" },
          }}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {!saveDisabled && onSaveSearch && (
          <SaveSearchButton
            sx={{
              minHeight: 44,
              width: { xs: "100%", sm: "auto" },
            }}
            onSave={handleSaveSearch}
            disabled={isLoading}
          />
        )}
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
