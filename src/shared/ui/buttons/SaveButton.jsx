import { Button } from "@mui/material";

function SaveSearchButton({ onSave, disabled }) {
  const handleSaveSearch = () => {
    onSave();
  };
  return (
    <Button
      variant="contained"
      sx={{
        bgcolor: "turquoise",
        "&:hover": { bgcolor: "darkturquoise" },
        color: "black",
        fontWeight: "bold",
        fontSize: "14px",
        width: { xs: "100%", sm: "auto" },
      }}
      onClick={handleSaveSearch}
      disabled={Boolean(disabled)}
    >
      Save Search
    </Button>
  );
}

export default SaveSearchButton;
