import React, { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Tooltip from "@mui/material/Tooltip";
import { db } from "../../../../backend/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

function SaveForLaterButton({ item, userId }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, []);

  const checkIfSaved = async () => {
    const q = query(
      collection(db, "saved-items"),
      where("itemId", "==", item.id),
      where("user-id", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    setIsSaved(!querySnapshot.empty);
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        const q = query(
          collection(db, "saved-items"),
          where("itemId", "==", item.id),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      } else {
        await addDoc(collection(db, "saved-items"), {
          itemId: item.id,
          userId: userId,
          item: item,
        });
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling save status", error);
    }
  };

  return (
    <Tooltip title={isSaved ? "Remove from saved items" : "Save for later"}>
      <IconButton onClick={handleToggleSave} sx={{ color: "primary.main" }}>
        {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default SaveForLaterButton;
