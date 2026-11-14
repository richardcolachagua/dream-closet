import { useEffect, useState } from "react";
import {
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
  Tooltip,
} from "@mui/material";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import { onSnapshot } from "firebase/firestore";
import { useAuth } from "../../auth/AuthContext";
import { savedItemReference, toggleSavedItem } from "../savedDataService";
import { colors } from "../../../shared/ui/theme/designTokens";

export default function SaveForLaterButton({ item, userId, sx }) {
  const { user, isRegistered } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enabled = isRegistered && user?.uid === userId;
  const source = item?.source;
  const productUrl = item?.productUrl;

  useEffect(() => {
    let active = true;
    let unsubscribe;
    setSaved(false);
    setError("");
    if (!enabled) return undefined;
    savedItemReference(userId, { source, productUrl })
      .then((reference) => {
        if (!active) return;
        unsubscribe = onSnapshot(
          reference,
          (snapshot) => {
            if (active) setSaved(snapshot.exists());
          },
          (failure) => {
            if (active) setError(failure.message);
          },
        );
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [enabled, userId, source, productUrl]);

  const toggle = async () => {
    if (!enabled || busy) return;
    setBusy(true);
    setError("");
    try {
      await toggleSavedItem(userId, item);
    } catch (failure) {
      setError(failure.message || "Could not update your saved items.");
    } finally {
      setBusy(false);
    }
  };
  const label = !enabled
    ? "Sign in to save items"
    : saved
      ? "Remove saved item"
      : "Save for later";
  return (
    <>
      <Tooltip title={label}>
        <span>
          <IconButton
            onClick={toggle}
            disabled={!enabled || busy}
            aria-label={label}
            sx={{ color: saved ? colors.accent : colors.textPrimary, ...sx }}
          >
            {busy ? (
              <CircularProgress size={18} />
            ) : saved ? (
              <BookmarkIcon />
            ) : (
              <BookmarkBorderIcon />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
