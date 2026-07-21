import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const cardSx = {
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
  boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
  px: { xs: 2.25, sm: 3 },
  py: { xs: 2.25, sm: 3 },
};

function AccountPreferencesCard({ initialEmailOptIn = true, onSave }) {
  const [emailOptIn, setEmailOptIn] = useState(initialEmailOptIn);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await onSave?.({ emailOptIn });
      setSuccess("Preferences updated.");
    } catch {
      setError(
        "We couldn’t save your preferences right now. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={cardSx}>
      <Stack spacing={2.25}>
        <Box sx={sectionEyebrowSx}>Preferences</Box>

        <Box>
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: "1.18rem",
              mb: 0.75,
            }}
          >
            Communication settings
          </Typography>

          <Typography
            sx={{
              color: colors.textSecondary,
              lineHeight: 1.72,
              maxWidth: 720,
            }}
          >
            Choose whether Dream Closet can send you product updates, feature
            news, and occasional account-related email communication.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: colors.border }} />

        <Box
          sx={{
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
            bgcolor: colors.surface2,
            px: 2,
            py: 1.75,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: colors.accentSoft,
                  color: colors.accent,
                  flexShrink: 0,
                }}
              >
                <MailOutlineRoundedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: colors.textPrimary,
                    fontWeight: 700,
                    mb: 0.25,
                  }}
                >
                  Email updates
                </Typography>
                <Typography
                  sx={{
                    color: colors.textMuted,
                    fontSize: "0.92rem",
                    lineHeight: 1.55,
                  }}
                >
                  Receive occasional product news and account-related updates.
                </Typography>
              </Box>
            </Stack>

            <Switch
              checked={emailOptIn}
              onChange={(event) => setEmailOptIn(event.target.checked)}
              color="primary"
            />
          </Stack>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ borderRadius: radius.md }}>
            {error}
          </Alert>
        ) : null}

        {success ? (
          <Alert severity="success" sx={{ borderRadius: radius.md }}>
            {success}
          </Alert>
        ) : null}

        <Box>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={primaryButtonSx}
          >
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

export default AccountPreferencesCard;
