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
            values.currentPassword
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
          console.warn(
            "[ProfilePage] No Firestore document found for user."
          );
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
        { merge: true }
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
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <ProfilePageHeader />
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" color="grey.100" gutterBottom>
          Welcome {currentUserInfo.firstName}
        </Typography>

        {/* Existing profile form */}
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          noValidate
          sx={{ mt: 2 }}
        >
          {/* ... keep all your existing Grid/TextField/password fields ... */}
          <Grid container spacing={2}>
            {/* firstName, lastName, email, password fields, etc. */}
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? <CircularProgress size={20} /> : "Update Profile"}
            </Button>
          </Box>
        </Box>

        {/* Style preferences card */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 2,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            bgcolor: "rgba(0,0,0,0.6)",
          }}
        >
          <Typography variant="h5" color="grey.100" gutterBottom>
            Style preferences
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
                    : [...prev, c]
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
                    : [...prev, b]
                )
              }
              loading={savingOnboarding}
            />
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveOnboarding}
            disabled={!editGender || savingOnboarding}
          >
            {savingOnboarding ? <CircularProgress size={20} /> : "Save style preferences"}
          </Button>
        </Box>
      </Container>

      <Footer />
      <ToastContainer />
    </ThemeProvider>
  );
};

export default ProfilePage;
