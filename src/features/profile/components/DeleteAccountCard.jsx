import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "firebase/auth";
import { auth } from "../../../backend/firebase/firebase";
// Later: import a callable Cloud Function that deletes Firestore data.

function DeleteAccountCard({ onDeleteServerSide }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleOpen = () => {
    setError("");
    setOpen(true);
  };

  const handleClose = () => {
    if (deleting) return;
    setOpen(false);
  };

  const handleConfirmDelete = async () => {
    setError("");
    setDeleting(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        setError("You need to be signed in to delete your account.");
        setDeleting(false);
        return;
      }

      // 1. Call backend to delete Firestore data, saved items/searches, etc.
      await onDeleteServerSide?.(user);

      // 2. Delete Firebase Auth user.
      await deleteUser(user);

      // 3. Redirect to a public page (homepage).
      navigate("/homepage", { replace: true });
    } catch (err) {
      console.error("Error deleting account", err);
      setError(
        "We couldn’t delete your account right now. Please try again or contact support.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.18)",
          backgroundColor: "rgba(255,0,0,0.04)",
          p: 3,
        }}
      >
        <Stack spacing={1.5}>
          <Typography
            variant="h5"
            sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 800 }}
          >
            Delete account
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
            Permanently delete your Dream Closet account and associated data.
            This action can’t be undone, and you’ll lose saved searches, saved
            items, and subscription access. [web:106][web:109]
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Button
            variant="outlined"
            color="error"
            onClick={handleOpen}
            sx={{
              alignSelf: "flex-start",
              mt: 1,
              borderRadius: "16px",
              textTransform: "none",
              fontWeight: 800,
              borderColor: "rgba(255,255,255,0.5)",
              color: "rgba(255,255,255,0.9)",
              "&:hover": {
                borderColor: "rgba(255,0,0,0.8)",
                bgcolor: "rgba(255,0,0,0.1)",
              },
            }}
          >
            Delete my account
          </Button>
        </Stack>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Confirm account deletion</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.5 }}>Deleting your account will:</Typography>
          <ul>
            <li>Remove your profile and onboarding preferences.</li>
            <li>Remove saved searches and saved items.</li>
            <li>Cancel any active Dream Closet Pro subscription.</li>
          </ul>
          <Typography sx={{ mt: 1.5 }}>
            This action is permanent and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={deleting}>
            Keep my account
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteAccountCard;
