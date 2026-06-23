import React, { useMemo, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Container,
  CssBaseline,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../backend/firebase/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Header from "../../shared/ui/navigation/PublicHeader";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../shared/ui/navigation/Footer";

const theme = createTheme();

const normalizeName = (value = "") => value.replace(/\s+/g, " ").trim();

const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required("First Name is required")
    .max(60, "Too long"),
  lastName: Yup.string()
    .trim()
    .required("Last Name is required")
    .max(60, "Too long"),
  email: Yup.string()
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
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const getFriendlySignupError = (code) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Please choose a stronger password.";
    case "auth/popup-closed-by-user":
      return "Google sign-up was cancelled.";
    default:
      return "We couldn’t create your account. Please try again.";
  }
};
const buildUserPayload = ({ firstName, lastName, email }) => ({
  firstName: normalizeName(firstName),
  lastName: normalizeName(lastName),
  email: (email || "").trim().toLowerCase(),
  onboarding: {
    gender: null,
    categories: [],
    brands: [],
    completed: false,
  },
  preferences: {
    emailNotifications: true,
  },
  subscription: {
    status: "inactive",
    plan: "free",
    customerId: null,
    subscriptionId: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  },
  updatedAt: serverTimestamp(),
});
const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const redirectTarget = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" && from.startsWith("/onboarding")
      ? from
      : "/onboarding/gender";
  }, [location.state]);

  const persistAndRedirect = () => {
    navigate(redirectTarget, { replace: true });
  };

  const upsertUserDocument = async ({ uid, firstName, lastName, email }) => {
    const userRef = doc(db, "users", uid);
    const existing = await getDoc(userRef);

    const payload = buildUserPayload({ firstName, lastName, email });

    if (!existing.exists()) {
      await setDoc(userRef, {
        ...payload,
        createdAt: serverTimestamp(),
      });
      return;
    }

    const existingData = existing.data();
    await setDoc(
      userRef,
      {
        ...payload,
        firstName: existingData?.firstName || payload.firstName,
        lastName: existingData?.lastName || payload.lastName,
        email: existingData?.email || payload.email,
        onboarding: {
          gender: existingData?.onboarding?.gender ?? null,
          categories: existingData?.onboarding?.categories ?? [],
          brands: existingData?.onboarding?.brands ?? [],
          completed: existingData?.onboarding?.completed ?? false,
        },
      },
      { merge: true },
    );
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setLoadingGoogle(true);

    try {
      await setPersistence(auth, browserSessionPersistence);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const fullName = (user.displayName || "User").trim();
      const names = fullName.split(/\s+/);
      const firstName = names[0] || "User";
      const lastName = names.slice(1).join(" ");

      await upsertUserDocument({
        uid: user.uid,
        firstName,
        lastName,
        email: user.email || "",
      });

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
        await setPersistence(auth, browserSessionPersistence);

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email.trim().toLowerCase(),
          values.password,
        );

        await upsertUserDocument({
          uid: userCredential.user.uid,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });

        persistAndRedirect();
      } catch (signupError) {
        setError(getFriendlySignupError(signupError?.code));
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

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
      <ThemeProvider theme={theme}>
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
                marginTop: 4,
                marginBottom: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                component="h1"
                variant="h5"
                sx={{ fontWeight: "bold" }}
              >
                Sign Up
              </Typography>

              {error && (
                <Alert severity="error" sx={{ width: "100%", mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ mt: 3, width: "100%" }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      autoComplete="given-name"
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      autoComplete="family-name"
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      autoComplete="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="password"
                      name="password"
                      label="Password"
                      type="password"
                      autoComplete="new-password"
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
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirm Password"
                      type="password"
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
                    />
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 3,
                    mb: 2,
                    backgroundColor: "black",
                    color: "white",
                    minHeight: 48,
                    fontWeight: 700,
                    textTransform: "none",
                  }}
                  disabled={formik.isSubmitting || loadingGoogle}
                >
                  {formik.isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <Stack>
                  <Button
                    variant="contained"
                    aria-label="Sign Up With Google"
                    startIcon={<GoogleIcon />}
                    sx={{
                      mb: 2,
                      backgroundColor: "turquoise",
                      color: "black",
                      minHeight: 48,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                    onClick={handleGoogleSignUp}
                    disabled={formik.isSubmitting || loadingGoogle}
                  >
                    {loadingGoogle ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Sign Up With Google"
                    )}
                  </Button>
                </Stack>
              </Box>

              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link to="/loginpage" style={{ textDecoration: "none" }}>
                    <Typography variant="body2">
                      Already have an account? Sign in
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

export default SignUpPage;
