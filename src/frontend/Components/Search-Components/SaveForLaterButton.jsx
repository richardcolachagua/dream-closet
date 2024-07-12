import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Tooltip from "@mui/material/Tooltip";

function SaveForLaterButton({ itemId, onSave }) {
  const handleSaveForLater = async () => {
    try {
      const response = await fetch("/api/save-forlater", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });
      if (response.ok) {
        onSave(itemId);
      }
    } catch (error) {
      console.error("Error saving item", error);
    }
  };

  return (
    <Tooltip title="Save for later">
      <IconButton onClick={handleSaveForLater} sx={{ color: "primary.main" }}>
        <BookmarkBorderIcon />
      </IconButton>
    </Tooltip>
  );
}

export default SaveForLaterButton;
