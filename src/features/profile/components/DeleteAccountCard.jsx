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
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { deleteUser } from "firebase/auth";
import { auth, functions } from "../../../backend/firebase/firebase";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

const cardSx = {
  borderRadius: radius.xl,
  backgroundColor: "rgba(161,53,68,0.08)",
  border: "1px solid rgba(161,53,68,0.22)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
  px: { xs: 2.25, sm: 3 },
  py: { xs: 2.25, sm: 3 },
};

function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidConfirmation = confirmText.trim() === "DELETE";

  const handleOpen = () => {
    setError("");
    setConfirmText("");
    setOpen(true);
  };

  const handleClose = () => {
    if (deleting) return;
    setOpen(false);
  };

  const handleConfirmDelete = async () => {
    setError("");

    const user = auth.currentUser;
    if (!user) {
      setError("You need to be signed in to delete your account.");
      return;
    }

    if (!isValidConfirmation) {
      setError('Please type "DELETE" to confirm.');
      return;
    }

    setDeleting(true);

    try {
      const deleteAccount = httpsCallable(functions, "deleteAccount");
      await deleteAccount();
      await deleteUser(user);
      navigate(ROUTES.HOMEPAGE, { replace: true });
    } catch (err) {
      setError(
        err?.message ||
          "We couldn’t delete your account right now. Please try again or contact support.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Box sx={cardSx}>
        <Stack spacing={2}>
          <Box>
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              Delete account
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Permanently delete your Dream Closet account, saved items, saved
              searches, and account data.
            </Typography>
          </Box>

          {error ? (
            <Alert severity="error" sx={{ borderRadius: radius.md }}>
              {error}
            </Alert>
          ) : null}

          <Box>
            <Button
              variant="outlined"
              onClick={handleOpen}
              sx={{
                minHeight: 46,
                borderRadius: radius.md,
                textTransform: "none",
                fontWeight: 800,
                color: "#ffb8c0",
                borderColor: "rgba(255,184,192,0.35)",
                "&:hover": {
                  borderColor: "#ffb8c0",
                  backgroundColor: "rgba(255,184,192,0.06)",
                },
              }}
            >
              Delete my account
            </Button>
          </Box>
        </Stack>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: radius.xl,
            backgroundColor: "#111",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Confirm account deletion
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Deleting your account will permanently remove:
            </Typography>

            <Box
              component="ul"
              sx={{ pl: 2.5, m: 0, color: "rgba(255,255,255,0.86)" }}
            >
              <li>Your profile and onboarding preferences</li>
              <li>Your saved searches and saved items</li>
              <li>Your active subscription access</li>
            </Box>

            <Typography sx={{ color: "#ffb8c0", fontWeight: 700 }}>
              This action cannot be undone.
            </Typography>

            <TextField
              fullWidth
              label='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: radius.md,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.12)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.22)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.accent,
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.62)",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: colors.accent,
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={handleClose}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Keep my account
          </Button>

          <Button
            onClick={handleConfirmDelete}
            disabled={deleting || !isValidConfirmation}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: radius.md,
              backgroundColor: "#a13544",
              "&:hover": {
                backgroundColor: "#8b2d3a",
              },
            }}
          >
            {deleting ? "Deleting..." : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteAccountCard;
