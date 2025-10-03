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

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastAttempt, setLastAttempt] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset attempt count every hour
  useEffect(() => {
    if (attemptCount === 0) return;
    const timer = setTimeout(() => setAttemptCount(0), 3600000);
    return () => clearTimeout(timer);
  }, [attemptCount]);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values) => {
      setError("");

      const now = Date.now();
      if (now - lastAttempt < 60000 || attemptCount >= 5) {
        setError("Too many attempts. Please try again later.");
        return;
      }

      setLoading(true);
      setLastAttempt(now);
      setAttemptCount((prev) => prev + 1);

      try {
        await sendPasswordResetEmail(FirebaseAuth, values.email);
        setSuccess(true);
      } catch (error) {
        setError(error.message || "Failed to send reset email");
      } finally {
        setLoading(false);
      }
    },
  });

  if (success) {
    return <CheckYourEmail email={formik.values.email} />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Stack
        direction="column"
        sx={{
          padding: "40px 0 30px 40px",
          alignContent: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{ color: "white", mb: 3 }}
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
              fontWeight: "bold",
              color: "turquoise",
              fontFamily: "Times New Roman",
            }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              pt: 1,
            }}
          >
            Please enter your email to reset your password. We'll send you a
            link to reset your password.
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          alignContent: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Typography
            sx={{
              fontWeight: "bold",
              color: "white",
              mb: "15px",
            }}
          >
            Your Email
          </Typography>
          <TextField
            label="Enter your email"
            name="email"
            type="email"
            value={formik.values.email}
            variant="filled"
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            sx={{
              width: "400px",
              mb: 1,
              backgroundColor: "white",
            }}
            required
          />
          <Stack
            direction="column"
            sx={{
              alignItems: "flex-start",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "10px",
                width: "200px",
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
          </Stack>
        </form>
        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            width: "100%",
          }}
        >
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default ForgotPassword;
