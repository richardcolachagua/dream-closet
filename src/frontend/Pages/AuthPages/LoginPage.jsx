import React, { useMemo, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Container,
  CssBaseline,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import Header from "../../Components/Headers/Header";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "../../../backend/firebase";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const defaultTheme = createTheme();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const validationSchema = Yup.object().shape({
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

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" && from.startsWith("/")
      ? from
      : "/searchpage";
  }, [location.state]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attemptState, setAttemptState] = useState({
    count: 0,
    lockedUntil: null,
  });

  const isLocked =
    attemptState.lockedUntil && Date.now() < attemptState.lockedUntil;

  const registerFailure = () => {
    setAttemptState((prev) => {
      const nextCount = prev.count + 1;
      if (nextCount >= MAX_ATTEMPTS) {
        return {
          count: nextCount,
          lockedUntil: Date.now() + LOCKOUT_MS,
        };
      }
      return {
        count: nextCount,
        lockedUntil: prev.lockedUntil,
      };
    });
  };

  const resetAttemptState = () => {
    setAttemptState({ count: 0, lockedUntil: null });
  };

  const completeLoginRedirect = () => {
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
        completeLoginRedirect();
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
      completeLoginRedirect();
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(/assets/backgroundImage.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <Header />
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          <Container
            component="main"
            maxWidth="xs"
            sx={{ backgroundColor: "white", borderRadius: 2 }}
          >
            <CssBaseline />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 3,
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: "bold" }}
              >
                Sign In
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ width: "100%", mt: 2 }}
              >
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />

                <TextField
                  margin="normal"
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
                  helperText={formik.touched.password && formik.errors.password}
                  sx={{ mb: 2 }}
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

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 2,
                    mb: 2,
                    backgroundColor: "black",
                    color: "white",
                    minHeight: 48,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                  disabled={loading || isLocked}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GoogleIcon />}
                sx={{
                  mt: 1,
                  py: 1.2,
                  backgroundColor: "turquoise",
                  color: "black",
                  minHeight: 48,
                  fontWeight: 700,
                  textTransform: "none",
                }}
                onClick={handleGoogleSignIn}
                disabled={loading || isLocked}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign in with Google"
                )}
              </Button>

              <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
                <Grid item>
                  <Link to="/forgotpassword" style={{ textDecoration: "none" }}>
                    Forgot Password
                  </Link>
                </Grid>
              </Grid>

              <Grid container justifyContent="flex-end" sx={{ mt: 1 }}>
                <Grid item>
                  <Link to="/signuppage" style={{ textDecoration: "none" }}>
                    <Typography
                      color="black"
                      align="center"
                      sx={{ fontWeight: "bold", fontFamily: "Helvetica Neue" }}
                    >
                      Don&apos;t have an account? Sign Up
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Grid>
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default LoginPage;
