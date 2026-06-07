import React, { useMemo, useState } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  Alert,
  Stack,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth as FirebaseAuth } from "../../../backend/firebase";
import * as Yup from "yup";
import { useFormik } from "formik";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .required("Enter a password."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your new password"),
});

const getFriendlyResetError = (code) => {
  switch (code) {
    case "auth/expired-action-code":
      return "This password reset link has expired. Please request a new one.";
    case "auth/invalid-action-code":
      return "This password reset link is invalid. Please request a new one.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support.";
    case "auth/weak-password":
      return "Please choose a stronger password.";
    default:
      return "We couldn’t update your password. Please try again.";
  }
};

const SetANewPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [actionCodeError, setActionCodeError] = useState("");

  const actionCode = useMemo(() => {
    const code = new URLSearchParams(window.location.search).get("oobCode");
    if (!code) {
      setActionCodeError(
        "Missing or invalid password reset link. Please request a new one.",
      );
      return null;
    }
    return code;
  }, []);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setError("");

      if (!actionCode) {
        setError(
          "Missing or invalid password reset link. Please request a new one.",
        );
        helpers.setSubmitting(false);
        return;
      }

      try {
        await confirmPasswordReset(FirebaseAuth, actionCode, values.password);
        navigate("/successful", { replace: true });
      } catch (resetError) {
        setError(getFriendlyResetError(resetError?.code));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const loading = formik.isSubmitting;
  const topLevelError = actionCodeError || error;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
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
          maxWidth: 560,
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{
            color: "white",
            marginBottom: "30px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(-1);
          }}
        />

        <Typography
          variant="h3"
          sx={{
            display: "flex",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
          }}
        >
          Set a new password
        </Typography>

        <Typography variant="h5" sx={{ color: "gray", mb: 3 }}>
          Create a new password and make sure it differs from previous ones.
        </Typography>

        {topLevelError && (
          <Alert severity="error" sx={{ mb: 3, width: "100%" }}>
            {topLevelError}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography
            variant="h6"
            sx={{
              display: "flex",
              fontWeight: "bold",
              color: "white",
              marginBottom: "10px",
            }}
          >
            Password
          </Typography>

          <TextField
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            variant="outlined"
            required
            fullWidth
            sx={{
              marginBottom: "15px",
              backgroundColor: "white",
              borderRadius: 1,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Typography
            variant="h6"
            sx={{
              display: "flex",
              fontWeight: "bold",
              color: "white",
              marginBottom: "10px",
            }}
          >
            Confirm Password
          </Typography>

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
            required
            variant="outlined"
            fullWidth
            sx={{
              paddingBottom: "30px",
              backgroundColor: "white",
              borderRadius: 1,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="column" sx={{ alignItems: "center" }}>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || !actionCode}
              sx={{
                borderRadius: "10px",
                width: "200px",
                minHeight: 48,
                textTransform: "none",
                fontWeight: 700,
              }}
              aria-label="Confirm new password"
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Password"
              )}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default SetANewPassword;
