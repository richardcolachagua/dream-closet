import React, { useState } from "react";
import { Typography, Box, Stack, Link, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth as FirebaseAuth } from "../../../backend/firebase";

const CheckYourEmail = ({ email }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleResendEmail = async () => {
    setError("");
    setSuccess("");
    try {
      await sendPasswordResetEmail(FirebaseAuth, email);
      setSuccess("Password reset email resent successfully!");
    } catch (error) {
      setError("An error occurred. Please try again");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleResendEmail();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          paddingTop: "40px",
          paddingBottom: "30px",
          alignContent: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{ color: "white", mb: "3" }}
          onClick={() => navigate(-1)}
          aria-label="Go back"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(-1);
          }}
        />
        <Box>
          <Typography
            variant="h3"
            sx={{
              alignContent: "center",
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
              alignContent: "center",
              display: "flex",
              color: "white",
              pt: 1,
            }}
          >
            We sent a reset link to {email}. Click the link to reset your
            password.
          </Typography>
        </Box>
        <Stack direction="row" sx={{ mt: 2 }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              marginRight: "5px",
            }}
          >
            Haven't got the email yet?
          </Typography>
          <Link
            variant="h5"
            sx={{
              color: "white",
              cursor: "pointer",
            }}
            onClick={handleResendEmail}
            onKeyPress={handleKeyPress}
            tabIndex={0}
            role="button"
            aria-label="Resend password reset email"
          >
            Resend Email
          </Link>
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default CheckYourEmail;
