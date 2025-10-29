import { useState, useEffect } from "react";
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
    const checkIfSaved = async () => {
      if (!item.itemId || !userId) return;
      const q = query(
        collection(db, "saved-items"),
        where("itemId", "==", item.itemId),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      setIsSaved(!querySnapshot.empty);
    };
    checkIfSaved();
  }, [item.itemId, userId]);

  const handleToggleSave = async () => {
    if (!item || !item.itemId || !userId) return;
    try {
      if (isSaved) {
        const q = query(
          collection(db, "saved-items"),
          where("itemId", "==", item.itemId),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      } else {
        await addDoc(collection(db, "saved-items"), {
          itemId: item.itemId, // always use itemId
          userId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          productUrl: item.productUrl,
          source: item.source,
          description: item.description,
        });
      }
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
