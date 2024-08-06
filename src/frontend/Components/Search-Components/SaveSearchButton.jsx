import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import Tooltip from "@mui/material/Tooltip";

function SaveSearchButton({ onSave, disabled }) {
  const handleSaveSearch = () => {
    onSave();
  };
  return (
    <Tooltip title="save this search">
      <span>
        <IconButton onClick={handleSaveSearch} disabled={disabled}>
          <BookmarkAddIcon sx={{ color: "red" }} />
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default SaveSearchButton;
