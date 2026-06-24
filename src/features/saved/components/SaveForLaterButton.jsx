import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Tooltip from "@mui/material/Tooltip";
import { db } from "../../../backend/firebase/firebase";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { buildSavedItemPayload } from "../../search/utils/buildSavedItemPayload";

function SaveForLaterButton({ item, userId, sx }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!item?.itemId || !userId) return;

      const q = query(
        collection(db, "saved-items"),
        where("itemId", "==", String(item.itemId)),
        where("userId", "==", userId),
      );

      const querySnapshot = await getDocs(q);
      setIsSaved(!querySnapshot.empty);
    };

    checkIfSaved();
  }, [item?.itemId, userId]);

  const handleToggleSave = async () => {
    if (!item?.itemId || !userId) return;

    try {
      if (isSaved) {
        const q = query(
          collection(db, "saved-items"),
          where("itemId", "==", String(item.itemId)),
          where("userId", "==", userId),
        );
        const querySnapshot = await getDocs(q);
        await Promise.all(querySnapshot.docs.map((doc) => deleteDoc(doc.ref)));
        setIsSaved(false);
      } else {
        await addDoc(collection(db, "saved-items"), {
          ...buildSavedItemPayload(item, userId),
          userId,
          itemId: String(item.itemId),
          name: item.name || item.title || "",
          imageUrl: item.imageUrl || "",
          price: item.price || "Price unavailable",
          numericPrice:
            typeof item.numericPrice === "number" ? item.numericPrice : null,
          productUrl: item.productUrl || "",
          brand: item.brand || "",
          source: item.source || "",
          description: item.description || "",
          createdAt: serverTimestamp(),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling save status", error);
    }
  };

  return (
    <Tooltip title={isSaved ? "Remove from saved items" : "Save for later"}>
      <IconButton onClick={handleToggleSave} sx={sx}>
        {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
      </IconButton>
    </Tooltip>
  );
}

export default SaveForLaterButton;
