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
import AWS from "aws-sdk";
import * as Yup from "yup";
import { useFormik } from "formik";

// Initialize AWS SDK with AWS credentials and region

AWS.config.update({
  region: "YOUR_AWS_REGION",
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: "YOUR_IDENTITY_POOL_ID",
  }),
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const LoginPage = () => {
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
        const { email, password } = values;
        //Retrieve user record from DynamoDB based on email
        const params = {
          TableName: "YOUR_DYNAMO_TABLE_NAME",
          Key: { email },
        };
        const { Item } = await dynamoDB.get(params).promise();

        if (!Item) {
          setLoading(false);
          setError("User not found");
          return;
        }
        //Compare hashed passwords
        //Note: Ensure you're using a secure hashing algorithm (e.g., bcrypt) for password hashing

        if (Item.password !== password) {
          setLoading(false);
          setError("Invalid password");
          return;
        }
        //Authentification successful
        setError(false);
        setError("");
        console.log("Login Successful");
        //Redirect user to dashboard or home page
      } catch (error) {
        setLoading(false);
        console.error("Login failed", error);
        setError("An error occured. Please try again later.");
      }
    },
  });

  return (
    <ThemeProvider theme={defaultTheme}>
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
