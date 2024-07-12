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
        <IconButton
          onClick={handleSaveSearch}
          sx={{ color: "secondary.main" }}
          disabled={disabled}
        >
          <BookmarkAddIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default SaveSearchButton;
