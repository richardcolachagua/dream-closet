import React, { useEffect, useMemo, useState } from "react";
import Footer from "../../../shared/ui/navigation/Footer.jsx";
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
  Alert,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ProfilePageHeader from "../../profile/components/ProfileHeader.jsx";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, app } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext.js";
import GenderSelectStep from "../../onboarding/components/GenderStep.jsx";
import CategoryMultiSelectStep from "../../onboarding/components/CategoryStep.jsx";
import BrandMultiSelectStep from "../../onboarding/components/BrandStep.jsx";
import {
  femaleCategories,
  maleCategories,
} from "../../onboarding/pages/OnboardingCategoriesPage.jsx";
import { buildBrandGroupsForGender } from "../../onboarding/pages/OnboardingBrandsPage.jsx";

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

const DEFAULT_ONBOARDING = {
  completed: false,
  gender: "",
  categories: [],
  brands: [],
};

const defaultTheme = createTheme();

const ProfilePage = () => {
  const auth = getAuth();
  const { user, loading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [currentUserInfo, setCurrentUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    onboarding: DEFAULT_ONBOARDING,
  });

  const [editGender, setEditGender] = useState("");
  const [editCategories, setEditCategories] = useState([]);
  const [editBrands, setEditBrands] = useState([]);
  const [savingOnboarding, setSavingOnboarding] = useState(false);

  const availableCategories = useMemo(() => {
    if (editGender === "female") return femaleCategories;
    if (editGender === "male") return maleCategories;
    return [];
  }, [editGender]);

  const brandGroups = useMemo(
    () => buildBrandGroupsForGender(editGender),
    [editGender],
  );

  const allowedBrands = useMemo(
    () => brandGroups.flatMap((group) => group.brands),
    [brandGroups],
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: currentUserInfo.firstName || "",
      lastName: currentUserInfo.lastName || "",
      email: currentUserInfo.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        if (!user) {
          toast.error("You must be logged in to update your profile");
          return;
        }

        const updatedValues = {};
        let passwordUpdated = false;

        if (values.firstName !== currentUserInfo.firstName) {
          updatedValues.firstName = values.firstName.trim();
        }

        if (values.lastName !== currentUserInfo.lastName) {
          updatedValues.lastName = values.lastName.trim();
        }

        if (values.email !== currentUserInfo.email) {
          updatedValues.email = values.email.trim();
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

          setCurrentUserInfo((prev) => ({
            ...prev,
            ...updatedValues,
          }));
        }

        if (passwordUpdated || Object.keys(updatedValues).length > 0) {
          toast.success("Profile updated successfully");
          resetForm({
            values: {
              firstName:
                updatedValues.firstName ?? currentUserInfo.firstName ?? "",
              lastName:
                updatedValues.lastName ?? currentUserInfo.lastName ?? "",
              email: updatedValues.email ?? currentUserInfo.email ?? "",
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            },
          });
        } else {
          toast.info("No changes detected");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(error.message || "An error occurred. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setProfileError("No authenticated user found.");
          setPageLoading(false);
        }
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!isMounted) return;

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const onboarding = {
            completed: Boolean(userData?.onboarding?.completed),
            gender: userData?.onboarding?.gender || "",
            categories: Array.isArray(userData?.onboarding?.categories)
              ? userData.onboarding.categories
              : [],
            brands: Array.isArray(userData?.onboarding?.brands)
              ? userData.onboarding.brands
              : [],
          };

          setCurrentUserInfo({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: user.email || "",
            onboarding,
          });

          setEditGender(onboarding.gender);
          setEditCategories(onboarding.categories);
          setEditBrands(onboarding.brands);
        } else {
          setCurrentUserInfo({
            firstName: "",
            lastName: "",
            email: user.email || "",
            onboarding: DEFAULT_ONBOARDING,
          });
          setEditGender("");
          setEditCategories([]);
          setEditBrands([]);
        }
      } catch (error) {
        console.error("[ProfilePage] Error fetching user data:", error);
        if (isMounted) {
          setProfileError("Could not load your profile.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    setEditCategories((prev) =>
      prev.filter((category) => availableCategories.includes(category)),
    );
  }, [availableCategories]);

  useEffect(() => {
    setEditBrands((prev) =>
      prev.filter((brand) => allowedBrands.includes(brand)),
    );
  }, [allowedBrands]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleCategory = (category) => {
    setEditCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const handleToggleBrand = (brand) => {
    setEditBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand],
    );
  };

  const handleSaveOnboarding = async () => {
    if (!user) {
      toast.error("You must be logged in to update preferences");
      return;
    }

    if (!editGender) {
      toast.error("Please pick how you shop for clothes");
      return;
    }

    if (editCategories.length === 0) {
      toast.error("Pick at least one category you like");
      return;
    }

    if (editBrands.length === 0) {
      toast.error("Pick at least one brand you like");
      return;
    }

    setSavingOnboarding(true);

    try {
      const ref = doc(db, "users", user.uid);
      const nextOnboarding = {
        gender: editGender,
        categories: editCategories,
        brands: editBrands,
        completed: true,
      };

      await setDoc(
        ref,
        {
          onboarding: nextOnboarding,
        },
        { merge: true },
      );

      setCurrentUserInfo((prev) => ({
        ...prev,
        onboarding: nextOnboarding,
      }));

      toast.success("Style preferences updated");
    } catch (e) {
      console.error("Error updating onboarding from profile:", e);
      toast.error("Could not update style preferences");
    } finally {
      setSavingOnboarding(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "black",
        }}
      >
        <CircularProgress sx={{ color: "turquoise" }} />
      </Box>
    );
  }

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
              pb: 0.5,
            }}
          >
            Welcome, {currentUserInfo.firstName || "there"}
          </Typography>

          {profileError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {profileError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            noValidate
            sx={{
              mt: 2,
              p: 4,
              bgcolor: "white",
              borderRadius: "20px",
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

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  variant="outlined"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  variant="outlined"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.lastName && Boolean(formik.errors.lastName)
                  }
                  helperText={formik.touched.lastName && formik.errors.lastName}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="currentPassword"
                  name="currentPassword"
                  label="Current Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.currentPassword &&
                    Boolean(formik.errors.currentPassword)
                  }
                  helperText={
                    formik.touched.currentPassword &&
                    formik.errors.currentPassword
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="newPassword"
                  name="newPassword"
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.newPassword &&
                    Boolean(formik.errors.newPassword)
                  }
                  helperText={
                    formik.touched.newPassword && formik.errors.newPassword
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.confirmNewPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.confirmNewPassword &&
                    Boolean(formik.errors.confirmNewPassword)
                  }
                  helperText={
                    formik.touched.confirmNewPassword &&
                    formik.errors.confirmNewPassword
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  fullWidth
                  sx={{
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
              </Grid>
            </Grid>
          </Box>

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

            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.72)", mb: 3 }}
            >
              Update how Dream Closet tailors search and recommendations for
              you.
            </Typography>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <GenderSelectStep
                selectedGender={editGender}
                onChangeGender={setEditGender}
                loading={false}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <CategoryMultiSelectStep
                categories={availableCategories}
                selectedCategories={editCategories}
                onToggleCategory={handleToggleCategory}
                loading={false}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <BrandMultiSelectStep
                brandGroups={brandGroups}
                selectedBrands={editBrands}
                onToggleBrand={handleToggleBrand}
                loading={savingOnboarding}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleSaveOnboarding}
              disabled={
                !editGender ||
                editCategories.length === 0 ||
                editBrands.length === 0 ||
                savingOnboarding
              }
              sx={{
                bgcolor: "turquoise",
                color: "black",
                fontWeight: "bold",
                textTransform: "none",
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
