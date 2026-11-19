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

function DeleteAccountCard({ recoveryMode = false }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deletionPending, setDeletionPending] = useState(false);
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
  const usesGoogleProvider = useMemo(
    () =>
      user?.providerData?.some(
        (provider) => provider.providerId === "google.com",
      ) ?? false,
    [user],
  );
  const canReauthenticate =
    Boolean(user && !user.isAnonymous) &&
    (usesPasswordProvider || usesGoogleProvider);

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

    if (usesGoogleProvider) {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
      return;
    }

    throw new Error(
      "Account deletion is not supported for this sign-in provider.",
    );
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
      if (!deletionPending) {
        try {
          await reauthenticateUser();
          await user.getIdToken(true);
        } catch (reauthenticationError) {
          if (
            !recoveryMode ||
            reauthenticationError?.code !== "auth/user-not-found"
          ) {
            throw reauthenticationError;
          }

          await httpsCallable(functions, "deleteAccount")({
            resumePendingDeletion: true,
          });
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.warn(
              "Local sign-out after deletion was skipped:",
              signOutError,
            );
          }
          navigate(ROUTES.HOME, { replace: true });
          return;
        }
      }

      const deleteAccount = httpsCallable(functions, "deleteAccount");
      if (deletionPending) {
        await deleteAccount({ resumePendingDeletion: true });
      } else {
        await deleteAccount();
      }

      try {
        await signOut(auth);
      } catch (signOutError) {
        console.warn(
          "Local sign-out after deletion was skipped:",
          signOutError,
        );
      }

      navigate(ROUTES.HOME, { replace: true });
    } catch (err) {
      console.error("Account deletion failed:", err);
      if (err?.details?.deletionPending) {
        setDeletionPending(true);
      }

      if (
        err?.code === "auth/wrong-password" ||
        err?.code === "auth/invalid-credential"
      ) {
        setError("Your credentials could not be verified. Please try again.");
      } else if (err?.code === "auth/popup-closed-by-user") {
        setError("Google sign-in was canceled. Your account was not deleted.");
      } else if (err?.code === "functions/failed-precondition") {
        setError(
          err.message ||
            "Account deletion could not proceed. Please sign in again or contact support.",
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
                items, saved searches, and account access. Any active Stripe
                subscription will be canceled immediately.
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

            <Alert severity="info" sx={{ borderRadius: radius.md }}>
              Stripe may retain financial and transaction records. Deleting
              your Dream Closet account does not erase those records from
              Stripe.
            </Alert>

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
            ) : usesGoogleProvider ? (
              <Alert severity="info" sx={{ borderRadius: radius.md }}>
                You will be asked to confirm with Google before your account is
                deleted.
              </Alert>
            ) : (
              <Alert severity="error" sx={{ borderRadius: radius.md }}>
                {user?.isAnonymous
                  ? "Anonymous accounts cannot be deleted here. Create or sign in to a registered account first."
                  : "This sign-in provider does not support account deletion yet."}
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
              !canReauthenticate ||
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
            {deleting
              ? "Deleting..."
              : deletionPending
                ? "Retry deletion"
                : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteAccountCard;
