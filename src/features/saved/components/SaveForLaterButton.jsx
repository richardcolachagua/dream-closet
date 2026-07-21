import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
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
import { colors } from "../../../shared/ui/theme/designTokens";

function SaveForLaterButton({ item, userId, sx }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!item?.itemId || !userId) {
        setIsSaved(false);
        return;
      }

      try {
        const q = query(
          collection(db, "saved-items"),
          where("itemId", "==", String(item.itemId)),
          where("userId", "==", userId),
        );

        const querySnapshot = await getDocs(q);
        setIsSaved(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking saved status", error);
      }
    };

    checkIfSaved();
  }, [item?.itemId, userId]);

  const handleToggleSave = async () => {
    if (!item?.itemId || !userId || loading) return;

    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const tooltipTitle = !userId
    ? "Sign in to save items"
    : isSaved
      ? "Remove from saved items"
      : "Save for later";

  return (
    <Tooltip title={tooltipTitle}>
      <span>
        <IconButton
          onClick={handleToggleSave}
          disabled={!userId || loading}
          aria-label={isSaved ? "Remove from saved items" : "Save for later"}
          sx={{
            color: isSaved ? colors.accent : colors.textPrimary,
            bgcolor: isSaved ? colors.accentSoft : "rgba(0,0,0,0.42)",
            border: `1px solid ${
              isSaved ? colors.accentBorder : "rgba(255,255,255,0.12)"
            }`,
            backdropFilter: "blur(10px)",
            "&:hover": {
              bgcolor: isSaved ? colors.accentSoft : "rgba(255,255,255,0.08)",
            },
            ...sx,
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "inherit" }} />
          ) : isSaved ? (
            <BookmarkIcon fontSize="small" />
          ) : (
            <BookmarkBorderIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default SaveForLaterButton;
