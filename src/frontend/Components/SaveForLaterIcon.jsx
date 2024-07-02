import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/material/BookmarkBorderIcon";

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
    <IconButton onClick={handleSaveForLater} sx={{ color: "primary.main" }}>
      <BookmarkBorderIcon />
    </IconButton>
  );
}

export default SaveForLaterButton;
