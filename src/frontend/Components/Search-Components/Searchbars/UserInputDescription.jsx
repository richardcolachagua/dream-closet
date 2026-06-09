import { useState } from "react";
import { TextField, Button, Box, InputAdornment } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SearchIcon from "@mui/icons-material/Search";
import SaveSearchButton from "../Buttons/SaveSearchButton";
import {
  buttonHeights,
  primaryButtonSx,
  secondaryButtonSx,
} from "../Buttons/buttonStyles";

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
        flexDirection: { xs: "column", md: "row" },
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(0,0,0,0.45)" }} />
            </InputAdornment>
          ),
          disableUnderline: true,
        }}
        sx={{
          flex: 1,
          "& .MuiFilledInput-root": {
            minHeight: buttonHeights.lg,
            backgroundColor: "white",
            borderRadius: "12px",
            overflow: "hidden",
          },
          "& .MuiFilledInput-root:hover": {
            backgroundColor: "white",
          },
          "& .MuiFilledInput-root.Mui-focused": {
            backgroundColor: "white",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          width: { xs: "100%", md: "auto" },
        }}
      >
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={onOpenFilters}
          sx={{
            ...secondaryButtonSx,
            minHeight: buttonHeights.lg,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {filterButtonLabel}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            ...primaryButtonSx,
            minHeight: buttonHeights.lg,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {!saveDisabled && onSaveSearch && (
          <SaveSearchButton
            sx={{
              minHeight: buttonHeights.lg,
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
