import React, { useMemo, useState } from "react";
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
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
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
  const [currentPassword, setCurrentPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = auth.currentUser;

  const usesPasswordProvider = useMemo(
    () =>
      user?.providerData?.some(
        (provider) => provider.providerId === "password",
      ) ?? false,
    [user],
  );

  const isValidConfirmation = confirmText.trim() === "DELETE";

  const handleOpen = () => {
    setError("");
    setConfirmText("");
    setCurrentPassword("");
    setOpen(true);
  };

  const handleClose = () => {
    if (deleting) return;
    setOpen(false);
  };

  const reauthenticateUser = async () => {
    if (!user) {
      throw new Error("You need to be signed in to delete your account.");
    }

    if (usesPasswordProvider) {
      if (!currentPassword) {
        throw new Error(
          "Enter your current password before deleting your account.",
        );
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );

      await reauthenticateWithCredential(user, credential);
      return;
    }

    const provider = new GoogleAuthProvider();
    await reauthenticateWithPopup(user, provider);
  };

  const handleConfirmDelete = async () => {
    setError("");

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
      await reauthenticateUser();

      // Refreshes the ID token after reauthentication so the callable can
      // verify a recent sign-in before performing an irreversible deletion.
      await user.getIdToken(true);

      const deleteAccount = httpsCallable(functions, "deleteAccount");
      await deleteAccount();

      await signOut(auth);
      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      console.error("Account deletion failed:", err);

      if (err?.code === "auth/wrong-password") {
        setError("That password is incorrect. Please try again.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was canceled. Your account was not deleted.");
      } else if (err?.code === "functions/failed-precondition") {
        setError(
          err.message ||
            "Your subscription could not be closed. Please contact support.",
        );
      } else {
        setError(
          err?.message ||
            "We couldn’t delete your account right now. Please try again or contact support.",
        );
      }
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
                Permanently delete your Dream Closet account, preferences, saved
                items, saved searches, and account access.
              </Typography>
            </Box>
          </Stack>

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
              Deleting your account permanently removes:
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
              <li>Your subscription access and billing connection</li>
            </Box>

            <Typography sx={{ color: "#ffb8c0", fontWeight: 700 }}>
              This action cannot be undone.
            </Typography>

            <Divider sx={{ borderColor: colors.border }} />

            {usesPasswordProvider ? (
              <TextField
                fullWidth
                required
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
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
            ) : (
              <Alert severity="info" sx={{ borderRadius: radius.md }}>
                You will be asked to confirm with Google before your account is
                deleted.
              </Alert>
            )}

            <TextField
              fullWidth
              required
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
            disabled={
              deleting ||
              !isValidConfirmation ||
              (usesPasswordProvider && !currentPassword)
            }
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
