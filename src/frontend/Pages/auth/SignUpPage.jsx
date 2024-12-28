import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Link,
  Grid,
  Container,
  CssBaseline,
  Stack,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../../../backend/firebase";
import { doc, setDoc } from "firebase/firestore";
import Header from "../../Components/Headers/Header";
import { useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";

const SignUpPage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;

      await setDoc(doc(db, "users", uid), {
        firstName: user.displayName.split(" ")[0],
        lastName: user.displayName.split(" ")[1] || "",
        email: user.email,
      });

      console.log("User signed up successfully with Google:", user);
      navigate("/searchpage");
    } catch (error) {
      console.error("Google sign-up failed:", error);
      setError("Google sign-up failed. Please try again.");
    }
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
        });

        console.log("user registered sucessfully:", user);
        navigate("/searchpage");
      } catch (error) {
        console.error("Signup error:", error);
        if (error.code === "auth/email-already-in-use") {
          setError("Email address already exists");
        } else {
          setError("An error occurred. Please try again.");
        }
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
      <ThemeProvider theme={createTheme()}>
        <Header />
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          style={{ minHeight: "100vh" }}
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
                sx={{
                  fontWeight: "bold",
                }}
              >
                Sign Up
              </Typography>
              <Box
                component="form"
                onSubmit={formik.handleSubmit}
                sx={{ mt: 3 }}
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
                  }}
                  disabled={formik.isSubmitting}
                >
                  Sign Up
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
                    }}
                    onClick={() => handleGoogleSignUp("google")}
                  >
                    SIGN UP WITH GOOGLE
                  </Button>
                  {/* Error message display */}
                  {error && (
                    <Typography color="error" align="center">
                      {error}
                    </Typography>
                  )}
                </Stack>
              </Box>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link
                    href="/loginpage"
                    variant="body2"
                    to="/LoginPage"
                    sx={{ Link: "/loginpage" }}
                    style={{ textDecoration: "none" }}
                  >
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Grid>
      </ThemeProvider>
      <Footer />
    </Box>
  );
};

export default SignUpPage;
