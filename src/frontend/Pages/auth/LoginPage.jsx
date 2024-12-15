import React, { useState } from "react";
import {
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Container,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import Header from "../../Components/Headers/Header";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../Components/Footer";
import { signInWithEmailAndPassword } from "firebase/auth";

const defaultTheme = createTheme();

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const navigate = useNavigate();
  const { handleLoginWithEmailAndPass, handleGoogleLogin } = useAuth();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(values.email, values.password);
        navigate("/searchpage");
      } catch (error) {
        console.error("login failed", error);
        if (error.code === "auth/user-not-found") {
          setError("Login failed. Please check your credentials.");
        } else if (error.code === "auth/wrong-password") {
          setError("Incorrect password. Please try again.");
        } else if (error.code === "auth/invalid-email") {
          setError("Invalid email address. Please check your email.");
        } else {
          setError("Login failed, Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await handleGoogleLogin();
      navigate("/searchpage");
    } catch (error) {
      console.error("Google sign-in failed", error);
      setError("Google sign-in failed. Please try again.");
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
          style={{ minHeight: "100vh" }}
        >
          <Container
            component="main"
            maxWidth="xs"
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          >
            <CssBaseline />
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingBottom: "20px",
                paddingTop: "20px",
              }}
            >
              <Typography component="h1" variant="h5">
                Sign In
              </Typography>
              <form onSubmit={formik.handleSubmit}>
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
                  name="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  helperText={formik.touched.password && formik.errors.password}
                />
                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                )}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <Button
                fullWidth
                variant="contained"
                startIcon={<GoogleIcon />}
                sx={{
                  mt: 1,
                  color: "white",
                  py: 1,
                }}
                onClick={handleGoogleSignIn}
                disable={loading}
              >
                Sign in with Google
              </Button>

              <Grid
                container
                justifyContent="flex-end"
                sx={{
                  mt: 2,
                }}
              >
                <Grid item>
                  <Link to="/forgot-password" variant="body2">
                    Forgot Password
                  </Link>
                </Grid>
              </Grid>

              <Grid
                container
                justifyContent="flex-end"
                sx={{
                  mt: 2,
                }}
              >
                <Grid item>
                  <Link to="/SignUpPage" variant="body2">
                    <Typography
                      color="black"
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontFamily: "Helvetica Neue",
                      }}
                    >
                      Don't have an account? Sign Up
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
