import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import ProfileHeader from "../components/ProfileHeader.jsx";
import AccountPreferencesCard from "../components/AccountPreferencesCard.jsx";
import ManageSubscriptionCard from "../components/ManageSubscriptionCard.jsx";
import DeleteAccountCard from "../components/DeleteAccountCard.jsx";
import Footer from "../../../shared/ui/navigation/Footer.jsx";
import { db } from "../../../backend/firebase/firebase";
import { useAuth } from "../../auth/AuthContext.js";
import {
  colors,
  radius,
  typography,
} from "../../../shared/ui/theme/designTokens";

const theme = createTheme();

const DEFAULT_USER_DATA = {
  preferences: {
    emailNotifications: true,
  },
  subscription: null,
};

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    if (!user?.uid) {
      setUserData(DEFAULT_USER_DATA);
      setLoadingSettings(false);
      setPageError("You must be signed in to access account settings.");

      return undefined;
    }

    setLoadingSettings(true);
    setPageError("");

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setUserData(
          snapshot.exists()
            ? {
                ...DEFAULT_USER_DATA,
                ...snapshot.data(),
                preferences: {
                  ...DEFAULT_USER_DATA.preferences,
                  ...(snapshot.data()?.preferences || {}),
                },
              }
            : DEFAULT_USER_DATA,
        );

        setLoadingSettings(false);
      },
      (error) => {
        console.error("Failed to load account settings:", error);

        setUserData(DEFAULT_USER_DATA);
        setPageError("We couldn’t load your settings right now.");
        setLoadingSettings(false);
      },
    );

    return unsubscribe;
  }, [authLoading, user?.uid]);

  const emailOptIn = useMemo(
    () => userData?.preferences?.emailNotifications ?? true,
    [userData],
  );

  const subscription = useMemo(
    () => userData?.subscription || null,
    [userData],
  );

  const handleSavePreferences = async ({ emailOptIn: nextValue }) => {
    if (!user?.uid) {
      throw new Error("You must be signed in to save preferences.");
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        preferences: {
          emailNotifications: Boolean(nextValue),
        },
      },
      { merge: true },
    );
  };

  const isLoading = authLoading || loadingSettings;
  const canRenderSettings = Boolean(user?.uid) && !pageError;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(180deg, rgba(89,230,219,0.08) 0%, rgba(0,0,0,0) 28%), #050505",
        }}
      >
        <ProfileHeader />

        <Box
          component="main"
          sx={{
            flex: 1,
            py: { xs: 5, md: 8 },
          }}
        >
          <Container maxWidth="md">
            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{
                    color: colors.accent,
                    fontSize: typography.overline,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    mb: 1,
                  }}
                >
                  Account settings
                </Typography>

                <Typography
                  component="h1"
                  sx={{
                    color: colors.textPrimary,
                    fontWeight: 800,
                    fontSize: {
                      xs: "2rem",
                      md: "2.5rem",
                    },
                    lineHeight: 1.12,
                    mb: 1,
                  }}
                >
                  Manage your account
                </Typography>

                <Typography
                  sx={{
                    color: colors.textSecondary,
                    maxWidth: 760,
                    fontSize: {
                      xs: "0.98rem",
                      md: "1.02rem",
                    },
                    lineHeight: 1.72,
                  }}
                >
                  Update communication preferences, manage billing, and control
                  account-level actions from one place.
                </Typography>
              </Box>

              {pageError ? (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: radius.lg,
                  }}
                >
                  {pageError}
                </Alert>
              ) : null}

              {isLoading ? (
                <Box
                  sx={{
                    minHeight: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CircularProgress sx={{ color: colors.accent }} />
                </Box>
              ) : null}

              {canRenderSettings ? (
                <Stack spacing={3}>
                  <AccountPreferencesCard
                    initialEmailOptIn={emailOptIn}
                    onSave={handleSavePreferences}
                  />

                  <ManageSubscriptionCard subscription={subscription} />

                  <DeleteAccountCard />
                </Stack>
              ) : null}
            </Stack>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default SettingsPage;
