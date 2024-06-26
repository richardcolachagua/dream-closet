import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

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
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Update Your Profile
      </Typography>
      <Formik
        initialValues={existingUserData}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
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
              name="currentPassword"
              label="Current Password"
              type="password"
              fullWidth
              error={touched.currentPassword && Boolean(errors.currentPassword)}
              helperText={touched.currentPassword && errors.currentPassword}
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
            <Field
              as={TextField}
              name="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              fullWidth
              error={
                touched.confirmNewPassword && Boolean(errors.confirmNewPassword)
              }
              helperText={
                touched.confirmNewPassword && errors.confirmNewPassword
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
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Update Profile"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default ProfilePage;
