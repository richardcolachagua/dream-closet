import React, { useState } from "react";
import Header from "../Components/Header";
import Footer from "../Components/Footer.jsx";
import { Formik, Form, Field } from "formik";
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
} from "@mui/material";
import Searches from "../Components/Searches.jsx";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  email: Yup.string().required("Email is required"),
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().required("New password is required"),
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
  const [successMessage, setSuccessMessage] = useState();

  const existingUserData = {
    firsName: "John",
    lastName: "Doe",
    email: "john,doe@example.com.",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const changedValues = Object.keys(values).reduce((acc, key) => {
        if (
          values[key] !== existingUserData[key] &&
          key !== "currentPassword"
        ) {
          acc[key] = values[key];
        }
        return acc;
      }, {});

      if (Object.keys(changedValues).length === 0) {
        setFieldError(
          "currentPassword",
          "No changes detected. Please modify at least one field to update."
        );
        setSubmitting(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Updated Profile", values);
      setSuccessMessage("Profile Successfully updated");
    } catch (err) {
      console.error("Failed to update profile", err);
      setFieldError(
        "currentPassword",
        "Failed to authenticate. Please check your current password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Container
        sx={{
          backgroundImage: `url(/assets/technology_gradient_with_black_at_the_top.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          maxWidth: 600,
          mx: "auto",
          p: 3,
        }}
      >
        <ThemeProvider theme={defaultTheme}>
          <Header />

          <Box>
            <Typography
              variant="h2"
              sx={{ mb: 3, fontWeight: "bold", color: "white" }}
            >
              Welcome Richard
            </Typography>

            <Typography
              variant="h4"
              sx={{ mb: 3, fontWeight: "bold", color: "white" }}
            >
              Update Your Profile
            </Typography>
            <Formik
              initialValues={existingUserData}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, values }) => (
                <Form>
                  <Field
                    as={TextField}
                    name="firstName"
                    label="First Name"
                    fullWidth
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    sx={{ mb: 2 }}
                  />

                  <Field
                    as={TextField}
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    sx={{ mb: 2 }}
                  />
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    sx={{ mb: 2 }}
                  />
                  <Field
                    as={TextField}
                    name="newPassword"
                    label="New Password (optional)"
                    type="password"
                    fullWidth
                    error={touched.newPassword && Boolean(errors.newPassword)}
                    helperText={touched.newPassword && errors.newPassword}
                    sx={{ mb: 2 }}
                  />
                  {values.newPassword && (
                    <Field
                      as={TextField}
                      name="confirmNewPassword"
                      label="Confirm New Password"
                      type="password"
                      fullWidth
                      error={
                        touched.confirmNewPassword &&
                        Boolean(errors.confirmNewPassword)
                      }
                      helperText={
                        touched.confirmNewPassword && errors.confirmNewPassword
                      }
                      sx={{ mb: 2 }}
                    />
                  )}
                  <Field
                    as={TextField}
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    fullWidth
                    error={
                      touched.currentPassword && Boolean(errors.currentPassword)
                    }
                    helperText={
                      touched.currentPassword && errors.currentPassword
                    }
                    sx={{ mb: 2 }}
                  />
                  {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      {successMessage}
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    fullWidth
                    sx={{
                      marginRight: "10px",
                      backgroundColor: "turquoise",
                      textTransform: "none",
                      fontSize: "15px",
                      fontWeight: "bold",
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Update Profile"
                    )}
                  </Button>
                </Form>
              )}
            </Formik>
          </Box>
        </ThemeProvider>{" "}
        <Container>
          <Searches />
        </Container>{" "}
      </Container>
      <Footer />
    </>
  );
};

export default ProfilePage;
