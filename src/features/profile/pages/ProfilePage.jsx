import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { useNavigate } from "react-router-dom";
import { db, functions } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext";
import { ROUTES } from "../../../app/routes/routePaths";
import ProfileHeader from "../components/ProfileHeader";
import Footer from "../../../shared/ui/navigation/Footer";
import GenderStep from "../../onboarding/components/GenderStep";
import CategoryStep from "../../onboarding/components/CategoryStep";
import BrandStep from "../../onboarding/components/BrandStep";
import {
  buildBrandGroupsForGender,
  categoriesForGender,
  validateOnboarding,
} from "../../onboarding/utils/onboardingSchema";
import { colors } from "../../../shared/ui/theme/designTokens";

const theme = createTheme();
const schema = Yup.object({
  firstName: Yup.string().trim().max(60),
  lastName: Yup.string().trim().max(60),
  newPassword: Yup.string().min(8, "Use at least 8 characters"),
  currentPassword: Yup.string().when("newPassword", {
    is: (value) => Boolean(value),
    then: (value) => value.required("Enter your current password"),
  }),
  confirmNewPassword: Yup.string().when("newPassword", {
    is: (value) => Boolean(value),
    then: (value) =>
      value
        .required("Confirm your new password")
        .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  }),
});
const panel = {
  p: { xs: 2, sm: 4 },
  bgcolor: "white",
  color: "black",
  borderRadius: 3,
};

function ProfileEditor({ user, profile }) {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [styleBusy, setStyleBusy] = useState(false);
  const [gender, setGender] = useState(profile.onboarding?.gender || "");
  const [categories, setCategories] = useState(
    profile.onboarding?.categories || [],
  );
  const [brands, setBrands] = useState(profile.onboarding?.brands || []);
  const hasPassword = user.providerData.some(
    (provider) => provider.providerId === "password",
  );
  const options = categoriesForGender(gender);
  const groups = useMemo(() => buildBrandGroupsForGender(gender), [gender]);
  const toggle = (setter, value) =>
    setter((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );

  const formik = useFormik({
    initialValues: {
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      setNotice(null);
      try {
        const changes = {};
        for (const key of ["firstName", "lastName"]) {
          const value = values[key].replace(/\s+/g, " ").trim();
          if (value !== profile[key]) changes[key] = value;
        }
        let nameSaved = false;
        if (Object.keys(changes).length) {
          const result = await httpsCallable(
            functions,
            "updateUserProfile",
          )(changes);
          nameSaved = true;
          if (!result.data.authDisplayNameSynced) {
            setNotice({
              severity: "warning",
              text: "Profile saved. The sign-in display name could not be synchronized.",
            });
          }
        }
        if (values.newPassword) {
          if (!hasPassword)
            throw new Error(
              "Use your sign-in provider to manage your password.",
            );
          try {
            const credential = EmailAuthProvider.credential(
              user.email,
              values.currentPassword,
            );
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, values.newPassword);
          } catch (failure) {
            throw new Error(
              `${nameSaved ? "Your name was saved, but the password was not changed. " : ""}${failure.message}`,
            );
          }
        }
        helpers.setValues({
          ...values,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
        setNotice(
          (previous) =>
            previous || {
              severity: "success",
              text:
                nameSaved || values.newPassword
                  ? "Account changes saved."
                  : "No changes detected.",
            },
        );
      } catch (failure) {
        setNotice({ severity: "error", text: failure.message });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });
  const field = (name, label, type = "text") => (
    <TextField
      key={name}
      fullWidth
      name={name}
      label={label}
      type={type}
      value={formik.values[name]}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      disabled={formik.isSubmitting}
      error={Boolean(formik.touched[name] && formik.errors[name])}
      helperText={formik.touched[name] && formik.errors[name]}
      autoComplete={
        name === "currentPassword"
          ? "current-password"
          : type === "password"
            ? "new-password"
            : undefined
      }
    />
  );
  const saveStyle = async () => {
    setStyleBusy(true);
    setNotice(null);
    try {
      const onboarding = validateOnboarding({
        gender,
        categories,
        brands,
        completed: true,
      });
      await updateDoc(doc(db, "users", user.uid), {
        onboarding,
        updatedAt: serverTimestamp(),
      });
      setNotice({ severity: "success", text: "Style preferences saved." });
    } catch (failure) {
      setNotice({ severity: "error", text: failure.message });
    } finally {
      setStyleBusy(false);
    }
  };
  return (
    <Stack spacing={4}>
      <Typography variant="h3">
        Welcome, {profile.firstName || "there"}
      </Typography>
      {notice && <Alert severity={notice.severity}>{notice.text}</Alert>}
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        noValidate
        sx={panel}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Update your profile</Typography>
          {field("firstName", "First name")}
          {field("lastName", "Last name")}
          <TextField
            fullWidth
            label="Email"
            value={user.email || profile.email || ""}
            InputProps={{ readOnly: true }}
            helperText="Email changes are currently unavailable."
          />
          {hasPassword ? (
            <>
              <Divider />
              {field("currentPassword", "Current password", "password")}
              {field("newPassword", "New password", "password")}
              {field("confirmNewPassword", "Confirm new password", "password")}
            </>
          ) : (
            <Alert severity="info">
              Manage your password through your sign-in provider.
            </Alert>
          )}
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </Stack>
      </Box>
      <Box>
        <Typography variant="h5" gutterBottom>
          Account settings
        </Typography>
        <Button variant="outlined" onClick={() => navigate(ROUTES.SETTINGS)}>
          Open account settings
        </Button>
      </Box>
      <Stack spacing={3}>
        <Typography variant="h4">Style preferences</Typography>
        <GenderStep
          selectedGender={gender}
          loading={styleBusy}
          onChangeGender={(next) => {
            setGender(next);
            setCategories([]);
            setBrands([]);
          }}
        />
        <CategoryStep
          categories={options}
          selectedCategories={categories}
          onToggleCategory={(value) => toggle(setCategories, value)}
          loading={styleBusy}
        />
        <BrandStep
          brandGroups={groups}
          selectedBrands={brands}
          onToggleBrand={(value) => toggle(setBrands, value)}
          loading={styleBusy}
        />
        <Typography>Favorite brands are optional.</Typography>
        <Button
          variant="contained"
          disabled={styleBusy || !gender || !categories.length}
          onClick={saveStyle}
        >
          {styleBusy ? "Saving..." : "Save style preferences"}
        </Button>
      </Stack>
    </Stack>
  );
}
export default function ProfilePage() {
  const { user, profile, loading, profileLoading, profileError } = useAuth();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: colors.background,
          color: colors.textPrimary,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ProfileHeader />
        <Container maxWidth="md" sx={{ flex: 1, py: 5 }}>
          {loading || profileLoading ? (
            <CircularProgress />
          ) : profileError || !profile || !user ? (
            <Alert severity="error">Your profile could not be loaded.</Alert>
          ) : (
            <ProfileEditor key={user.uid} user={user} profile={profile} />
          )}
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}
