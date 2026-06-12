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

function SaveForLaterButton({ item, userId, sx }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!item.itemId || !userId) {
        console.warn("Missing itemId or userId; skipping check", {
          item,
          userId,
        });
        return;
      }
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
    console.log("handleToggleSave called. isSaved:", isSaved, { item, userId });
    if (!item.itemId) {
      console.error("No itemId field in item:", item);
      return;
    }
    if (!userId) {
      console.error("No userId provided");
      return;
    }
    try {
      if (isSaved) {
        console.log("Deleting item", item.itemId, userId);
        const q = query(
          collection(db, "saved-items"),
          where("itemId", "==", item.itemId),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach((doc) =>
          console.log("Deleting doc:", doc.id, doc.data())
        );
        await Promise.all(querySnapshot.docs.map((doc) => deleteDoc(doc.ref)));
        setIsSaved(false);
      } else {
        console.log("Saving item", item.itemId, userId);
        const docRef = await addDoc(collection(db, "saved-items"), {
          itemId: item.itemId,
          userId,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          productUrl: item.productUrl,
          source: item.source,
          description: item.description || "",
        });
        console.log("Saved item docRef:", docRef);
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
