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
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { withRouter } from "react-router-dom";
import Header from "../Components/Header";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = ({ history }) => {
  const defaultTheme = createTheme();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const response = await axios.post("/api/login", values);

        // Handle response from backend
        if (response.data.success) {
          // Authentication successful
          setError("");
          console.log("Login Successful");
          // Redirect use to home page
          history.push("/homepage");
        } else {
          //authentication failed
          setLoading(false);
          setError(response.data.error);
        }
      } catch (error) {
        setLoading(false);
        console.error("Login failed", error);
        setError("An error occurred. Please try again later.");
      }
    },
  });

  return (
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
                <Link href="#" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Grid>
    </ThemeProvider>
  );
};

export default LoginPage;
