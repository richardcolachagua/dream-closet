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
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import Header from "../../Components/Headers/Header";
import { Link, useNavigate } from "react-router-dom";

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

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/login`,
          values
        );

        if (response.data.success) {
          // Store the token in localStorage or a more secure storage method
          localStorage.setItem("token", response.data.token);

          //Store user info if needed
          localStorage.setItem("user", JSON.stringify(response.data.user));

          //Redirect user to search page
          navigate("/searchpage");
        } else {
          setError("Login failed. Please check your credentials.");
        }
      } catch (error) {
        console.error("Login Failed", error);
        setError(
          error.response?.data?.error ||
            "An error occurred. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box
      sx={{
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
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="#" variant="body2">
                    Forgot Password
                  </Link>
                </Grid>
              </Grid>
              <Grid container justifyContent="flex-end">
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
      </ThemeProvider>
    </Box>
  );
};

export default LoginPage;
