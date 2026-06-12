import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Box,
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import CheckYourEmail from "./CheckYourEmail";
import { auth as FirebaseAuth } from "../../../backend/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import * as Yup from "yup";
import { useFormik } from "formik";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const RESET_WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const HOUR_MS = 60 * 60 * 1000;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (attemptCount === 0) return;
    const timer = setTimeout(() => setAttemptCount(0), HOUR_MS);
    return () => clearTimeout(timer);
  }, [attemptCount]);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      setError("");

      const now = Date.now();
      if (now - lastAttempt < RESET_WINDOW_MS || attemptCount >= MAX_ATTEMPTS) {
        setError("Too many attempts. Please wait before trying again.");
        return;
      }

      setLoading(true);
      setLastAttempt(now);
      setAttemptCount((prev) => prev + 1);

      try {
        await sendPasswordResetEmail(FirebaseAuth, values.email.trim());
        setSuccess(true);
      } catch {
        setError("We couldn’t send a reset email right now. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return <CheckYourEmail email={formik.values.email.trim()} />;
  }

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
          padding: "40px 0 30px 40px",
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
              fontWeight: "bold",
              color: "turquoise",
              fontFamily: "Times New Roman",
            }}
          >
            Forgot Password
          </Typography>

          <Typography variant="h5" sx={{ color: "white", pt: 1 }}>
            Enter your email and we’ll send you a password reset link.
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          justifyContent: "center",
          display: "flex",
          maxWidth: 520,
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Typography sx={{ fontWeight: "bold", color: "white", mb: "15px" }}>
            Your Email
          </Typography>

          <TextField
            label="Enter your email"
            name="email"
            type="email"
            value={formik.values.email}
            variant="filled"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{
              width: "100%",
              mb: 1,
              backgroundColor: "white",
            }}
            required
          />

          <Stack direction="column" sx={{ alignItems: "flex-start", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "10px",
                width: "200px",
                minHeight: 48,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>
          </Stack>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default ForgotPassword;
