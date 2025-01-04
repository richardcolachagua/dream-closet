import React, { useState } from "react";
import Footer from "../../Components/Footer.jsx";
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
  Grid,
} from "@mui/material";
import axios from "axios";
import UserHeader from "../../Components/Headers/ProfileHeader.jsx";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: Yup.string().when("newPassword", {
    is: (val) => val && val.length > 0,
    then: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords must match")
      .required("Confirm Password is required when setting a new password"),
    otherwise: Yup.string(),
  }),
});

const ProfilePage = () => {
  const defaultTheme = createTheme();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState();

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
              Welcome {formik.values.firsName}
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
                color: "black"}}
            >
              Update Your Profile
            </Typography>
                  <form onSubmit={formik.handleSubmit}>
                    <TextField
                      fullWidth
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      variant="filled"
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
                      variant="filled"
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
                    {formik.values.newPassword &&
                      formik.values.newPassword.length > 0 && (
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
              </Container>
            </Grid>
          </Box>
        </ThemeProvider>
      </Box>

      <Footer />
    </>
  );
};

export default ProfilePage;
