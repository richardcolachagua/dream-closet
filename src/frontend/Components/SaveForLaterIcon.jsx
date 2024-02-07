import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/material/BookmarkBorderIcon";

function SaveForLaterButton({ itemId }) {
  const handleSaveForLater = () => {
    //Send a post request to the backend to save the item
    fetch("/api/save-for-later", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId }),
    });
  };

  return (
    <IconButton onClick={handleSaveForLater} sx={{ color: "primary.main" }}>
      <BookmarkBorderIcon />
    </IconButton>
  );
}

export default SaveForLaterButton;
