import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer.jsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  CssBaseline,
} from "@mui/material";
import axios from "axios";
import Searches from "../Components/Searches.jsx";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("invalid email address")
    .required("Email is required"),
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min("Password must be at least 8 characters"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .when("newPassword", {
      is: (val) => val && val.length > 0,
      then: Yup.string().required(
        "Confirm Password is required when setting a new password"
      ),
    }),
});

const ProfilePage = () => {
  const defaultTheme = createTheme();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState();

  const formik = useFormik({
    initialValues: {
      firsName: "John",
      lastName: "Doe",
      email: "john,doe@example.com",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const changedValues = Object.keys(values).reduce((acc, key) => {
          if (
            values[key] !== formik.initialValues[key] &&
            key !== "currentPassword"
          ) {
            acc[key] = values[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedValues).length === 0) {
          setError(
            "No changes detected. Please modify at least one field to update."
          );
          return;
        }

        const response = await axios.post("/api/update-profile", values);
        console.log("Profile updated successfully:", response.data);
        setSuccessMessage("Profile successfully updated");
        setError("");
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          setError(error.response.data.error);
        } else {
          setError("An error occurred. Please try again.");
        }
        setSuccessMessage("");
      }
    },
  });

  return (
    <>
      {" "}
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
          <Box my={4}>
            <CssBaseline />
            <Typography
              variant="h3"
              sx={{ mb: 3, fontWeight: "bold", color: "white" }}
            >
              Welcome {formik.values.firsName}
            </Typography>

            <Typography
              variant="h5"
              sx={{ mb: 3, fontWeight: "bold", color: "white" }}
            >
              Update Your Profile
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="filled-basic"
                name="firstName"
                label="First Name"
                variant="filled"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                id="filled-basic"
                name="lastName"
                label="Last Name"
                variant="filled"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password (optional)"
                type="password"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
                error={
                  formik.touched.newPassword &&
                  Boolean(formik.errors.newPassword)
                }
                helperText={
                  formik.touched.newPassword && formik.errors.newPassword
                }
                sx={{ mb: 2 }}
              />
              {formik.values.newPassword && (
                <TextField
                  fullWidth
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  type="password"
                  value={formik.values.confirmNewPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.confirmNewPassword &&
                    Boolean(formik.errors.confirmNewPassword)
                  }
                  helperText={
                    formik.touched.confirmNewPassword &&
                    formik.errors.confirmNewPassword
                  }
                  sx={{ mb: 2 }}
                />
              )}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
                fullWidth
                sx={{
                  marginRight: "10px",
                  backgroundColor: "turquoise",
                  textTransform: "none",
                  fontSize: "15px",
                  fontWeight: "bold",
                }}
              >
                {formik.isSubmitting ? (
                  <CircularProgress size={24} />
                ) : (
                  "Update Profile"
                )}
              </Button>
            </form>
          </Box>
        </ThemeProvider>
      </Box>
      <Container>
        <Searches />
      </Container>
      <Footer />
    </>
  );
};

export default ProfilePage;
