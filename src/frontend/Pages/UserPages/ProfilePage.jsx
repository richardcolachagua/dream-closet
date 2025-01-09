import React, { useState } from "react";
import Footer from "../../Components/Footer.jsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getFunctions, httpsCallable } from "firebase/functions";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
  CssBaseline,
  Grid,
} from "@mui/material";
import UserHeader from "../../Components/Headers/ProfileHeader.jsx";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: Yup.string().when("newPassword", (newPassword, schema) =>
    newPassword
      ? schema
          .oneOf([Yup.ref("newPassword")], "Passwords must match")
          .required("Confirm Password is required")
      : schema
  ),
});

const ProfilePage = () => {
  const defaultTheme = createTheme();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const auth = getAuth();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Handle password update separately
        if (values.newPassword) {
          const user = auth.currentUser;
          const credential = EmailAuthProvider.credential(
            user.email,
            values.currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, values.newPassword);
          toast.success("Password updated successfully");
        }

        //Handle other profile updates
        const changedValues = Object.keys(values).reduce((acc, key) => {
          if (
            values[key] !== formik.initialValues[key] &&
            !["currentPassword", "newPassword", "confirmNewPassword"].includes(
              key
            )
          ) {
            acc[key] = values[key];
          }
          return acc;
        }, {});

        if (Object.keys(changedValues).length > 0) {
          const functions = getFunctions();
          const updateProfile = httpsCallable(functions, "updateUserProfile");
          const result = await updateProfile(changedValues);
          console.log("Profile updated successfully:", result.data);
          toast.success("Profile updated successfully");

        }
        setError("");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "An error occurred. Please try again.");

      }
    },
  });

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "black",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
        }}
      >
        <ThemeProvider theme={defaultTheme}>
          <UserHeader />
          <Box my={4}>
            <Typography
              variant="h3"
              sx={{
                mb: 3,
                fontWeight: "bold",
                color: "white",
                marginLeft: "20px",
              }}
            >
              Welcome {formik.values.firstName}
            </Typography>
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: "10vh" }}
            >
              <Container
                component="main"
                maxWidth="xs"
                sx={{ backgroundColor: "white", borderRadius: 2 }}
              >
                <CssBaseline />
                <Box
                  sx={{
                    marginTop: 6,
                    marginBottom: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    component="h1"
                    variant="h5"
                    sx={{
                      mb: 3,
                      fontWeight: "bold",
                      color: "black",
                    }}
                  >
                    Update Your Profile
                  </Typography>
                  <form onSubmit={formik.handleSubmit}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      variant="outlined"
                      value={formik.values.firstName}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.firstName &&
                        Boolean(formik.errors.firstName)
                      }
                      helperText={
                        formik.touched.firstName && formik.errors.firstName
                      }
                      sx={{ mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      variant="outlined"
                      value={formik.values.lastName}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.lastName &&
                        Boolean(formik.errors.lastName)
                      }
                      helperText={
                        formik.touched.lastName && formik.errors.lastName
                      }
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      variant="outlined"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.email && Boolean(formik.errors.email)
                      }
                      helperText={formik.touched.email && formik.errors.email}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      id="currentPassword"
                      name="currentPassword"
                      label="Current Password"
                      type="password"
                      value={formik.values.currentPassword}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.currentPassword &&
                        Boolean(formik.errors.currentPassword)
                      }
                      helperText={
                        formik.touched.currentPassword &&
                        formik.errors.currentPassword
                      }
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
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
              </Container>
            </Grid>
          </Box>
        </ThemeProvider>
      </Box>
      <Footer />
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default ProfilePage;
