import React, { useEffect, useState } from "react";
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
  Container,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import UserHeader from "../../Components/Headers/ProfileHeader.jsx";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../backend/firebase.js";

const validationSchema = Yup.object({
  firstName: Yup.string(),
  lastName: Yup.string(),
  email: Yup.string().email("Invalid email address"),

  currentPassword: Yup.string().when("newPassword", {
    is: (value) => Boolean(value),
    then: (schema) =>
      schema.required("Current password is required to change the password"),
  }),

  newPassword: Yup.string().min(8, "Password must be at least 8 characters"),

  confirmNewPassword: Yup.string().oneOf(
    [Yup.ref("newPassword")],
    "Passwords must match"
  ),
});

const ProfilePage = () => {
  const defaultTheme = createTheme();
  const auth = getAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

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
        const user = auth.currentUser;
        const updatedValues = {};
        let passwordUpdated = false;

        if (
          values.firstName &&
          values.firstName !== currentUserInfo.firstName
        ) {
          updatedValues.firstName = values.firstName;
        }
        if (values.lastName && values.lastName !== currentUserInfo.lastName) {
          updatedValues.lastName = values.lastName;
        }
        if (values.email && values.email !== currentUserInfo.email) {
          updatedValues.email = values.email;
        }

        if (values.newPassword) {
          if (!values.currentPassword) {
            toast.error("Current password is required to change password");
            return;
          }
          const credential = EmailAuthProvider.credential(
            user.email,
            values.currentPassword
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, values.newPassword);
          passwordUpdated = true;
        }
        if (Object.keys(updatedValues).length > 0) {
          const functions = getFunctions();
          const updateProfile = httpsCallable(functions, "updateUserProfile");
          await updateProfile(updatedValues);
          setCurrentUserInfo((prev) => ({ ...prev, ...updatedValues }));
        }
        if (passwordUpdated || Object.keys(updatedValues).length > 0) {
          toast.success("Profile updated successfully");
          formik.resetForm();
        } else {
          toast.info("No changes detected");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "An error occurred.Please try again.");
      }
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCurrentUserInfo({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: user.email || "",
            });
            formik.setValues({
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: user.email || "",
              
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [auth, formik]);

  const handleTogglePasswordVisiblity = () => {
    setShowPassword(!showPassword);
  };

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
              Welcome {currentUserInfo.firstName}
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
                      type={showPassword ? "text" : "password"}
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisiblity}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? "text" : "password"}
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisiblity}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      label="Confirm New Password"
                      type={showPassword ? "text" : "password"}
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleTogglePasswordVisiblity}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
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
