import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

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
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.03)",
        p: 3,
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="h5" sx={{ color: "white", fontWeight: 800 }}>
          Preferences
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
          Control communication and account-level choices. Unsubscribing from
          emails should be simple and reversible. [web:95][web:104]
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={emailOptIn}
              onChange={(event) => setEmailOptIn(event.target.checked)}
              color="primary"
            />
          }
          sx={{ color: "white", mt: 1 }}
          label="Receive Dream Closet email updates"
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            alignSelf: "flex-start",
            mt: 1,
            bgcolor: "turquoise",
            color: "black",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "16px",
            "&:hover": { bgcolor: "#35d8cb" },
          }}
        >
          {saving ? "Saving..." : "Save preferences"}
        </Button>
      </Stack>
    </Box>
  );
}

export default AccountPreferencesCard;
