import React, { useState } from "react";
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

// Password complexity rules: min 8 chars, upper, lower, number, special char
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters.")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    )
    .required("Enter a password."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm your new password"),
});

const SetANewPassword = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setError("");
      setLoading(true);
      try {
        const actionCode = new URLSearchParams(window.location.search).get(
          "oobCode"
        );
        await confirmPasswordReset(FirebaseAuth, actionCode, values.password);
        navigate("/successfulpage");
      } catch (error) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box>
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
          sx={{
            color: "white",
            marginBottom: "30px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
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
              marginBottom: "20px",
            }}
          >
            Set a new password
          </Typography>
          <Typography variant="h5" sx={{ color: "gray" }}>
            Create a new password. Ensure it differs from previous ones for
            security.
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Typography
              variant="h4"
              sx={{
                alignContent: "center",
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
              sx={{ width: "400px", marginBottom: "15px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
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
              variant="h4"
              sx={{
                alignContent: "center",
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
              sx={{ width: "400px", paddingBottom: "30px" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
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
            <Stack
              direction="column"
              sx={{
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ borderRadius: "10px", width: "200px" }}
                aria-label="Confirm new password"
              >
                {loading ? <CircularProgress size={24} /> : "Update Password"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default SetANewPassword;
