import React, { useState } from "react";
import { Typography, Box, Stack, Link, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth as FirebaseAuth } from "../../../backend/firebase";

const CheckYourEmail = ({ email = "" }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResendEmail = async () => {
    setError("");
    setSuccess("");

    try {
      await sendPasswordResetEmail(FirebaseAuth, email.trim());
      setSuccess("Password reset email resent successfully.");
    } catch {
      setError("We couldn’t resend the email right now. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          paddingTop: "40px",
          paddingBottom: "30px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{ color: "white", mb: 3, cursor: "pointer" }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(-1);
          }}
        />

        <Box>
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              fontWeight: "bold",
              color: "white",
            }}
          >
            Check Your Email
          </Typography>

          <Typography
            variant="h5"
            sx={{
              display: "flex",
              color: "white",
              pt: 1,
            }}
          >
            We sent a reset link to {email}. Click the link in that email to
            reset your password.
          </Typography>
        </Box>

        <Stack direction="row" sx={{ mt: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6" sx={{ color: "white" }}>
            Haven&apos;t got the email yet?
          </Typography>

          <Link
            sx={{
              color: "turquoise",
              cursor: "pointer",
            }}
            onClick={handleResendEmail}
            tabIndex={0}
            role="button"
            aria-label="Resend password reset email"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleResendEmail();
              }
            }}
          >
            Resend Email
          </Link>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mt: 2, maxWidth: 520 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2, maxWidth: 520 }}>
            {success}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default CheckYourEmail;
