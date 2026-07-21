import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { deleteUser } from "firebase/auth";
import { auth, functions } from "../../../backend/firebase/firebase";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

const cardSx = {
  borderRadius: radius.xl,
  backgroundColor: "rgba(161,53,68,0.08)",
  border: "1px solid rgba(161,53,68,0.24)",
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
      navigate(ROUTES.HOME, { replace: true });
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
        <Stack spacing={2.25}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(161,53,68,0.18)",
                color: "#ffb8c0",
                flexShrink: 0,
              }}
            >
              <WarningAmberRoundedIcon />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.18rem",
                  mb: 0.5,
                }}
              >
                Danger zone
              </Typography>

              <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
                Permanently delete your Dream Closet account, saved items, saved
                searches, onboarding preferences, and access tied to the
                account.
              </Typography>
            </Box>
          </Stack>

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
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1.25 }}>
          Confirm account deletion
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
              Deleting your account will permanently remove:
            </Typography>

            <Box
              component="ul"
              sx={{
                pl: 2.5,
                m: 0,
                color: colors.textPrimary,
                "& li": { mb: 0.7 },
              }}
            >
              <li>Your profile and onboarding preferences</li>
              <li>Your saved searches and saved items</li>
              <li>Your active subscription access</li>
            </Box>

            <Typography sx={{ color: "#ffb8c0", fontWeight: 700 }}>
              This action cannot be undone.
            </Typography>

            <Divider sx={{ borderColor: colors.border }} />

            <TextField
              fullWidth
              label='Type "DELETE" to confirm'
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: radius.md,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  color: colors.textPrimary,
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

            {error ? (
              <Alert severity="error" sx={{ borderRadius: radius.md }}>
                {error}
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button
            onClick={handleClose}
            disabled={deleting}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: colors.textSecondary,
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
