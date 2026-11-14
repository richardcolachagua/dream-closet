import { useMemo, useState } from "react";
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
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../backend/firebase/firebase";
import PublicHeader from "../../shared/ui/navigation/PublicHeader.jsx";
import Footer from "../../shared/ui/navigation/Footer";
import { ROUTES } from "../../app/routes/routePaths";
import { colors, radius } from "../../shared/ui/theme/designTokens";
import {
  finishAccountSignIn,
  prepareAccountSession,
} from "../auth/profileService";

const theme = createTheme();

const normalizeName = (value = "") => value.replace(/\s+/g, " ").trim();

const validationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .required("First name is required")
    .max(60, "Too long"),
  lastName: Yup.string()
    .trim()
    .required("Last name is required")
    .max(60, "Too long"),
  email: Yup.string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[@$!%*?&]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const passwordRules = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One number", test: (value) => /[0-9]/.test(value) },
  {
    label: "One special character",
    test: (value) => /[@$!%*?&]/.test(value),
  },
];

const getPasswordStrength = (password) => {
  if (!password) return 0;

  return passwordRules.filter((rule) => rule.test(password)).length;
};

const strengthMeta = [
  { label: "", color: "transparent" },
  { label: "Very weak", color: "#ef5350" },
  { label: "Weak", color: "#fb8c00" },
  { label: "Fair", color: "#fbc02d" },
  { label: "Strong", color: "#66bb6a" },
  { label: "Very strong", color: "#43a047" },
];

const getFriendlySignupError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return (
        "An account with this email already exists. " +
        "Please sign in instead."
      );
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Please choose a stronger password.";
    case "auth/popup-closed-by-user":
      return "Google sign-up was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked Google sign-up. Allow popups and try again.";
    case "auth/network-request-failed":
      return "Please check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait and try again.";
    case "profile/initialization-failed":
      return (
        "Your account exists, but profile setup could not finish. " +
        "Please sign in to retry. You do not need to create another account."
      );
    default:
      return "We couldn't create your account. Please try again.";
  }
};

const authCardSx = {
  width: "100%",
  maxWidth: 540,
  borderRadius: radius.xl,
  border: "1px solid rgba(255,255,255,0.1)",
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

function SignUpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const redirectTarget = useMemo(() => {
    const from = location.state?.from;

    return typeof from === "string" && from.startsWith(ROUTES.ONBOARDING_ROOT)
      ? from
      : ROUTES.ONBOARDING_GENDER;
  }, [location.state]);

  const persistAndRedirect = () => {
    navigate(redirectTarget, { replace: true });
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoadingGoogle(true);

    try {
      await prepareAccountSession();

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);

      await finishAccountSignIn(result.user);

      persistAndRedirect();
    } catch (signupError) {
      setError(getFriendlySignupError(signupError?.code));
    } finally {
      setLoadingGoogle(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, helpers) => {
      setError("");

      try {
        await prepareAccountSession();

        const credential = await createUserWithEmailAndPassword(
          auth,
          values.email.trim().toLowerCase(),
          values.password,
        );

        const firstName = normalizeName(values.firstName);
        const lastName = normalizeName(values.lastName);

        try {
          await updateProfile(credential.user, {
            displayName: `${firstName} ${lastName}`.trim(),
          });
        } catch (displayNameError) {
          console.warn(
            "Could not update the Auth display name:",
            displayNameError,
          );
        }

        await finishAccountSignIn(credential.user, {
          firstName,
          lastName,
        });

        persistAndRedirect();
      } catch (signupError) {
        setError(getFriendlySignupError(signupError?.code));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const strength = getPasswordStrength(formik.values.password);
  const strengthInfo = strengthMeta[strength];
  const isBusy = formik.isSubmitting || loadingGoogle;

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
                  fontSize: { xs: "1.6rem", sm: "1.95rem" },
                  mb: 0.75,
                }}
              >
                Create your account
              </Typography>

              <Typography
                sx={{
                  textAlign: "center",
                  color: "rgba(0,0,0,0.62)",
                  fontSize: "0.96rem",
                  mb: 3,
                }}
              >
                Start building your dream closet with smarter search and saved
                style preferences.
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{ mb: 2.25, borderRadius: radius.md }}
                >
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  loadingGoogle ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <GoogleIcon />
                  )
                }
                onClick={handleGoogleSignUp}
                disabled={isBusy}
                sx={{ ...googleButtonSx, mb: 2 }}
              >
                {loadingGoogle ? "Signing up..." : "Sign up with Google"}
              </Button>

              <Divider
                sx={{
                  mb: 2.5,
                  color: "rgba(0,0,0,0.45)",
                  fontSize: "0.8rem",
                }}
              >
                or sign up with email
              </Divider>

              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First name"
                      autoComplete="given-name"
                      disabled={isBusy}
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.firstName &&
                        Boolean(formik.errors.firstName)
                      }
                      helperText={
                        formik.touched.firstName && formik.errors.firstName
                      }
                      sx={fieldSx}
                    />

                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last name"
                      autoComplete="family-name"
                      disabled={isBusy}
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.lastName &&
                        Boolean(formik.errors.lastName)
                      }
                      helperText={
                        formik.touched.lastName && formik.errors.lastName
                      }
                      sx={fieldSx}
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email address"
                    type="email"
                    autoComplete="email"
                    disabled={isBusy}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    sx={fieldSx}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isBusy}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
                      }
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              disabled={isBusy}
                              onClick={() =>
                                setShowPassword((previous) => !previous)
                              }
                              edge="end"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {formik.values.password && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(strength / 5) * 100}
                          aria-label="Password strength"
                          sx={{
                            height: 5,
                            borderRadius: 999,
                            backgroundColor: "rgba(0,0,0,0.08)",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: strengthInfo.color,
                              borderRadius: 999,
                            },
                          }}
                        />

                        <Typography
                          sx={{
                            mt: 0.6,
                            color: strengthInfo.color,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          {strengthInfo.label}
                        </Typography>

                        <Stack
                          direction="row"
                          flexWrap="wrap"
                          gap={0.75}
                          sx={{ mt: 1 }}
                        >
                          {passwordRules.map((rule) => {
                            const passed = rule.test(formik.values.password);

                            return (
                              <Box
                                key={rule.label}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.45,
                                  width: { xs: "100%", sm: "48%" },
                                  color: passed ? "#43a047" : "rgba(0,0,0,0.5)",
                                  fontSize: "0.76rem",
                                }}
                              >
                                {passed ? (
                                  <CheckCircleOutlineIcon
                                    sx={{ fontSize: "0.9rem" }}
                                  />
                                ) : (
                                  <RadioButtonUncheckedIcon
                                    sx={{ fontSize: "0.85rem" }}
                                  />
                                )}

                                {rule.label}
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    id="confirmPassword"
                    name="confirmPassword"
                    label="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={isBusy}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.confirmPassword &&
                      Boolean(formik.errors.confirmPassword)
                    }
                    helperText={
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    }
                    sx={fieldSx}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              setShowConfirmPassword((previous) => !previous)
                            }
                            edge="end"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isBusy}
                  sx={{ ...submitButtonSx, mt: 3 }}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Create account"
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
                Already have an account?{" "}
                <RouterLink
                  to={ROUTES.LOGIN}
                  style={{
                    color: "#111",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Sign in
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

export default SignUpPage;
