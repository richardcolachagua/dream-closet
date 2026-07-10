import React, { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import PublicHeader from "../../shared/ui/navigation/PublicHeader.jsx";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../shared/ui/navigation/Footer";
import { auth } from "../../backend/firebase/firebase";
import {
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { colors, radius } from "../../shared/ui/theme/designTokens";
import { ROUTES } from "../../app/routes/routePaths";

const theme = createTheme();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const getFriendlyAuthError = (code) => {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Login failed. Please check your email and password.";
    case "auth/invalid-email":
      return "Invalid email address. Please check your email.";
    case "auth/user-disabled":
      return "Your account is disabled. Contact support.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    default:
      return "Login failed. Please try again.";
  }
};

const authCardSx = {
  width: "100%",
  maxWidth: 500,
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  bgcolor: "rgba(255,255,255,0.94)",
  boxShadow: "0 22px 56px rgba(0,0,0,0.26)",
  px: { xs: 2.25, sm: 3.5 },
  py: { xs: 2.5, sm: 3.5 },
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 54,
    borderRadius: radius.md,
    backgroundColor: "#fafafa",
    color: "#111",
    transition: "box-shadow 180ms ease, border-color 180ms ease",
    "& fieldset": {
      borderColor: "rgba(0,0,0,0.12)",
    },
    "&:hover fieldset": {
      borderColor: colors.accent,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.accent,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      boxShadow: "0 0 0 4px rgba(89,230,219,0.16)",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(0,0,0,0.62)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: colors.accent,
  },
  "& .MuiFormHelperText-root": {
    ml: 0.25,
  },
};

const googleButtonSx = {
  minHeight: 48,
  borderRadius: radius.md,
  textTransform: "none",
  fontSize: "0.96rem",
  fontWeight: 800,
  backgroundColor: colors.accent,
  color: "#000",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: colors.accentHover,
    boxShadow: "none",
  },
};

const submitButtonSx = {
  minHeight: 48,
  borderRadius: radius.md,
  textTransform: "none",
  fontSize: "0.96rem",
  fontWeight: 800,
  backgroundColor: "#000",
  color: "#fff",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#111",
    boxShadow: "none",
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptState, setAttemptState] = useState({
    count: 0,
    lockedUntil: null,
  });

  const redirectTarget = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" && from.startsWith("/")
      ? from
      : ROUTES.SEARCH;
  }, [location.state]);

  const isLocked =
    attemptState.lockedUntil && Date.now() < attemptState.lockedUntil;

  const registerFailure = () => {
    setAttemptState((prev) => {
      const nextCount = prev.count + 1;
      return nextCount >= MAX_ATTEMPTS
        ? { count: nextCount, lockedUntil: Date.now() + LOCKOUT_MS }
        : { count: nextCount, lockedUntil: prev.lockedUntil };
    });
  };

  const resetAttemptState = () => {
    setAttemptState({ count: 0, lockedUntil: null });
  };

  const handleRedirect = () => {
    navigate(redirectTarget, { replace: true });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setError("");

      if (isLocked) {
        setError("Too many attempts. Please wait 15 minutes and try again.");
        return;
      }

      setLoading(true);

      try {
        await setPersistence(auth, browserSessionPersistence);
        await signInWithEmailAndPassword(
          auth,
          values.email.trim(),
          values.password,
        );
        resetAttemptState();
        handleRedirect();
      } catch (authError) {
        registerFailure();
        setError(getFriendlyAuthError(authError?.code));
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleSignIn = async () => {
    setError("");

    if (isLocked) {
      setError("Too many attempts. Please wait 15 minutes and try again.");
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
      resetAttemptState();
      handleRedirect();
    } catch (authError) {
      if (authError?.code !== "auth/popup-closed-by-user") {
        registerFailure();
      }
      setError(getFriendlyAuthError(authError?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: colors.background,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.58)), url("/assets/hero-bg.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <PublicHeader />

        <Box
          component="main"
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: { xs: 5, md: 8 },
          }}
        >
          <Container
            maxWidth="sm"
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box sx={authCardSx}>
              <Typography
                sx={{
                  color: colors.accent,
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  mb: 0.75,
                }}
              >
                Dream Closet
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  textAlign: "center",
                  fontWeight: 800,
                  color: "#111",
                  fontSize: { xs: "1.65rem", sm: "2rem" },
                  mb: 0.75,
                }}
              >
                Welcome back
              </Typography>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "rgba(0,0,0,0.62)",
                  fontSize: "0.96rem",
                  mb: 3,
                }}
              >
                Sign in to continue your search, saved items, and style profile.
              </Typography>

              {error ? (
                <Alert
                  severity="error"
                  sx={{ mb: 2.25, borderRadius: radius.md }}
                >
                  {error}
                </Alert>
              ) : null}

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <GoogleIcon />
                  )
                }
                onClick={handleGoogleSignIn}
                disabled={loading || isLocked}
                sx={{ ...googleButtonSx, mb: 2 }}
              >
                {loading ? "Signing in..." : "Sign in with Google"}
              </Button>

              <Divider
                sx={{ mb: 2.5, color: "rgba(0,0,0,0.45)", fontSize: "0.8rem" }}
              >
                or sign in with email
              </Divider>

              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    sx={fieldSx}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    sx={fieldSx}
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
                </Stack>

                <Box sx={{ textAlign: "right", mt: 1.1, mb: 2.5 }}>
                  <RouterLink
                    to={ROUTES.FORGOT_PASSWORD}
                    style={{
                      color: colors.accent,
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.86rem",
                    }}
                  >
                    Forgot password?
                  </RouterLink>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || isLocked || formik.isSubmitting}
                  sx={submitButtonSx}
                >
                  {formik.isSubmitting || loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Box>

              <Typography
                sx={{
                  textAlign: "center",
                  mt: 3,
                  color: "rgba(0,0,0,0.62)",
                  fontSize: "0.92rem",
                }}
              >
                Don&apos;t have an account?{" "}
                <RouterLink
                  to={ROUTES.SIGNUP}
                  style={{
                    color: "#111",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Sign up
                </RouterLink>
              </Typography>
            </Box>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default LoginPage;
