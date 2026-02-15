// src/frontend/Pages/Profile/ProfilePage.jsx
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
import ProfilePageHeader from "../../Components/Headers/ProfilePageHeader.jsx";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, app } from "../../../backend/firebase.js";

// IMPORT onboarding components + helpers
import GenderSelectStep from "../../Pages/Onboarding/GenderSelectStep.jsx";
import CategoryMultiSelectStep from "../../Pages/Onboarding/CategoryMultiSelectStep.jsx";
import BrandMultiSelectStep from "../../Pages/Onboarding/BrandMultiSelectStep.jsx";
import {
  femaleCategories,
  maleCategories,
} from "../../Pages/Onboarding/OnboardingCategories.jsx";
import { buildBrandGroupsForGender } from "../../Pages/Onboarding/OnboardingBrands.jsx";

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
    "Passwords must match",
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
    onboarding: {
      gender: "",
      categories: [],
      brands: [],
    },
  });

  // Local editable onboarding state
  const [editGender, setEditGender] = useState("");
  const [editCategories, setEditCategories] = useState([]);
  const [editBrands, setEditBrands] = useState([]);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

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
        if (!user) {
          toast.error("You must be logged in to update your profile");
          return;
        }

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
            values.currentPassword,
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, values.newPassword);
          passwordUpdated = true;
        }

        if (Object.keys(updatedValues).length > 0) {
          const functions = getFunctions(app);
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
        toast.error(error.message || "An error occurred. Please try again.");
      }
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn("[ProfilePage] No authenticated user found.");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const onboarding = userData.onboarding || {
            gender: "",
            categories: [],
            brands: [],
          };

          setCurrentUserInfo({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: user.email || "",
            onboarding,
          });

          formik.setValues({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: user.email || "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
          });

          // seed editable onboarding state
          setEditGender(onboarding.gender || "");
          setEditCategories(onboarding.categories || []);
          setEditBrands(onboarding.brands || []);
        } else {
          console.warn("[ProfilePage] No Firestore document found for user.");
        }
      } catch (error) {
        console.error("[ProfilePage] Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePasswordVisiblity = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSaveOnboarding = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    if (!editGender) {
      toast.error("Please pick how you shop for clothes");
      return;
    }

    setSavingOnboarding(true);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(
        ref,
        {
          onboarding: {
            gender: editGender,
            categories: editCategories,
            brands: editBrands,
            completed:
              Boolean(editGender) &&
              editCategories.length > 0 &&
              editBrands.length > 0,
          },
        },
        { merge: true },
      );

      setCurrentUserInfo((prev) => ({
        ...prev,
        onboarding: {
          gender: editGender,
          categories: editCategories,
          brands: editBrands,
        },
      }));

      toast.success("Style preferences updated");
    } catch (e) {
      console.error("Error updating onboarding from profile:", e);
      toast.error("Could not update style preferences");
    } finally {
      setSavingOnboarding(false);
    }
  };

  const brandGroups = buildBrandGroupsForGender(editGender);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflowX: "hidden",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <ProfilePageHeader />
        <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              color: "turquoise",
              fontWeight: "bold",
              paddingBottom: "5px"
            }}
          >
            Welcome, {currentUserInfo.firstName}
          </Typography>

          {/* Existing profile form */}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{ mt: 2, bgcolor: "white", borderRadius: "20px" }}
          >
            {/* ... keep all your existing Grid/TextField/password fields ... */}
            <Grid container spacing={2}>
              <Box
                sx={{
                  marginTop: 6,
                  marginLeft: 6,
                  marginRight: 6,
                  marginBottom: 6,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "white",
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
                      formik.touched.lastName && Boolean(formik.errors.lastName)
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
                    error={formik.touched.email && Boolean(formik.errors.email)}
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
                            {showPassword ? <VisibilityOff /> : <Visibility />}
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
            </Grid>
          </Box>

          {/* Style preferences card */}
          <Box
            sx={{
              mt: 6,
              p: 3,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              bgcolor: "black",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                color: "turquoise",
                fontWeight: "bold",
              }}
            >
              Style Preferences
            </Typography>

            {/* Gender */}
            <Box sx={{ mb: 3 }}>
              <GenderSelectStep
                selectedGender={editGender}
                onChangeGender={setEditGender}
                loading={false}
              />
            </Box>

            {/* Categories */}
            <Box sx={{ mb: 3 }}>
              <CategoryMultiSelectStep
                categories={
                  editGender === "female"
                    ? femaleCategories
                    : editGender === "male"
                      ? maleCategories
                      : []
                }
                selectedCategories={editCategories}
                onToggleCategory={(c) =>
                  setEditCategories((prev) =>
                    prev.includes(c)
                      ? prev.filter((x) => x !== c)
                      : [...prev, c],
                  )
                }
                loading={false}
              />
            </Box>

            {/* Brands */}
            <Box sx={{ mb: 3 }}>
              <BrandMultiSelectStep
                brandGroups={brandGroups}
                selectedBrands={editBrands}
                onToggleBrand={(b) =>
                  setEditBrands((prev) =>
                    prev.includes(b)
                      ? prev.filter((x) => x !== b)
                      : [...prev, b],
                  )
                }
                loading={savingOnboarding}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSaveOnboarding}
              disabled={!editGender || savingOnboarding}
              sx={{
                bgcolor: "turquoise",
                fontWeight: "bold",
              }}
            >
              {savingOnboarding ? (
                <CircularProgress size={20} />
              ) : (
                "Save style preferences"
              )}
            </Button>
          </Box>
        </Container>

        <Footer />
        <ToastContainer />
      </ThemeProvider>
    </Box>
  );
};

export default ProfilePage;
