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

function SaveForLaterButton({ item, userId, source }) {
  const [isSaved, setIsSaved] = useState(false);

  const createUnifiedItemStructure = (item, source) => {
    if (!item) return null;

    if (source === "ASOS") {
      return {
        id: item.id,
        name: item.name,
        price: item.price?.current?.text || "Price unavailable",
        imageUrl: item.imageUrl ? `https://${item.imageUrl}` : "",
        productUrl: item.url ? `https://www.asos.com/${item.url}` : "",
        source: "ASOS",
      };
    } else if (source === "RealTimeSearch") {
      return {
        id: item.product_id,
        name: item.product_title,
        price: item.offer?.price || "Price unavailable",
        imageUrl: item.product_photos?.[0] || "",
        productUrl: item.product_page_url || "",
        source: "RealTimeSearch",
      };
    }

    // default case for unknown sources
    return {
      id: item.id || item.product_id || Math.random().toString(),
      name: item.name || item.product_title || "Unknown item",
      price: "Price unavailable",
      imageUrl: "",
      productUrl: "",
      source: source || "Uknown",
    };
  };

  const unifiedItem = createUnifiedItemStructure(item, source);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!unifiedItem.id || !unifiedItem.id || !userId) return;

      const q = query(
        collection(db, "saved-items"),
        where("itemId", "==", unifiedItem.id),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      setIsSaved(!querySnapshot.empty);
    };

    checkIfSaved();
  }, [unifiedItem.id, userId]);

  const handleToggleSave = async () => {
    if (!unifiedItem || !unifiedItem.id) return;

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
          itemId: unifiedItem.id,
          userId: userId,
          name: unifiedItem.name,
          price: unifiedItem.price,
          imageUrl: unifiedItem.imageUrl,
          productUrl: unifiedItem.productUrl,
          source: unifiedItem.source,
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
