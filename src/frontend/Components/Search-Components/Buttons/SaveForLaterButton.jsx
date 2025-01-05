import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import Tooltip from "@mui/material/Tooltip";
import { db } from "../../../../backend/firebase";
import { addDoc, collection } from "firebase/firestore";

function SaveForLaterButton({ itemId, onSave }) {
  const handleSaveForLater = async () => {
    try {
      const docRef = await addDoc(collection(db, "saved-items"), {
        itemId,
      });
      if (docRef.id) {
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
