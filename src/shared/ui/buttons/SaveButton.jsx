import { Button } from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";

function SaveSearchButton({ onSave, disabled = false, sx = {} }) {
  return (
    <Button
      variant="outlined"
      startIcon={<BookmarkBorderIcon />}
      onClick={onSave}
      disabled={disabled}
      sx={{
        minHeight: 44,
        px: 2.25,
        borderRadius: 2,
        textTransform: "none",
        fontSize: "0.95rem",
        fontWeight: 700,
        borderColor: "rgba(255,255,255,0.2)",
        color: "white",
        whiteSpace: "nowrap",
        "&:hover": {
          borderColor: "turquoise",
          color: "turquoise",
          backgroundColor: "rgba(64,224,208,0.06)",
        },
        "&.Mui-disabled": {
          borderColor: "rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.35)",
        },
        ...sx,
      }}
    >
      Save Search
    </Button>
  );
}

export default SaveSearchButton;
