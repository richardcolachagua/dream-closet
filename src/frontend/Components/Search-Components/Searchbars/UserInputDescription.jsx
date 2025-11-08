import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import SaveSearchButton from "../Buttons/SaveSearchButton";
import { fetchCombinedResults } from "../utils/fetchCombinedResults";

function UserDescriptionInput({
  onSearchStart,
  onSearchResults,
  onSearchError,
  onSaveSearch,
  value,
  onChange,
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
      const results = await fetchCombinedResults(value);
      onSearchResults(results);
    } catch (error) {
      onSearchError(
        error.response?.status === 429
          ? "Too many requests. Please wait a moment."
          : "Error fetching results. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSearch = () => {
    if (!value || value.trim() === "") {
      onSearchError("Cannot save empty search");
      return;
    }
    onSaveSearch(value);
  };

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
      }}
    >
      <TextField
        label="I am looking for a..."
        variant="filled"
        value={value}
        onChange={onChange}
        sx={{
          width: "90%",
          maxWidth: "500px",
          backgroundColor: "white",
          borderRadius: "10px",
          mb: { xs: 2, sm: 0 },
          mr: { xs: 0, sm: 2 },
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
        <SaveSearchButton
          sx={{
            width: { xs: "100%", sm: "auto" },
          }}
          onSave={handleSaveSearch}
          disabled={isLoading}
        />
      </Box>
    </Box>
  );
}

export default UserDescriptionInput;
