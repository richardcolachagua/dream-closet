import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import SaveSearchButton from "../Buttons/SaveSearchButton";

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
  saveDisabled = false, // NEW: allow turning off save in free mode
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
    if (saveDisabled || !onSaveSearch) {
      return;
    }

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
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "center",
        mb: 3,
        width: "100%",
        px: 2,
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
        sx={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "white",
          borderRadius: "10px",
        }}
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1,
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={onOpenFilters}
          sx={{
            borderColor: "turquoise",
            color: "turquoise",
            fontWeight: "bold",
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
            bgcolor: "turquoise",
            "&:hover": { bgcolor: "darkturquoise" },
            color: "black",
            fontWeight: "bold",
            fontSize: "14px",
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>

        {!saveDisabled && onSaveSearch && (
          <SaveSearchButton
            sx={{
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
