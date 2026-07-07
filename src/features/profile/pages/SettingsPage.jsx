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
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import ProfileHeader from "../components/ProfileHeader.jsx";
import AccountPreferencesCard from "../components/AccountPreferencesCard.jsx";
import ManageSubscriptionCard from "../components/ManageSubscriptionCard.jsx";
import DeleteAccountCard from "../components/DeleteAccountCard.jsx";
import Footer from "../../../shared/ui/navigation/Footer.jsx";
import { auth, db } from "../../../backend/firebase/firebase";
import {
  colors,
  layout,
  spacing,
  typography,
} from "../../../shared/ui/theme/designTokens";

const theme = createTheme();

function SettingsPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      setLoading(false);
      setPageError("You must be signed in to access settings.");
      return undefined;
    }

    const userRef = doc(db, "users", uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        setUserData(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      () => {
        setPageError("We couldn’t load your settings right now.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const emailOptIn = useMemo(() => {
    return userData?.preferences?.emailNotifications ?? true;
  }, [userData]);

  const subscription = useMemo(() => {
    return userData?.subscription || null;
  }, [userData]);

  const handleSavePreferences = async ({ emailOptIn: nextValue }) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      throw new Error("Not signed in.");
    }

    await updateDoc(doc(db, "users", uid), {
      "preferences.emailNotifications": nextValue,
    });
  };

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

        <Box component="main" sx={{ flex: 1, py: { xs: 5, md: 8 } }}>
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
                  variant="h3"
                  sx={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                    mb: 1,
                  }}
                >
                  Manage your account
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: 760,
                    fontSize: { xs: "0.98rem", md: "1.02rem" },
                  }}
                >
                  Update communication preferences, manage billing, and control
                  account-level actions from one place.
                </Typography>
              </Box>

              {pageError ? (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {pageError}
                </Alert>
              ) : null}

              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 240,
                  }}
                >
                  <CircularProgress sx={{ color: colors.accent }} />
                </Box>
              ) : (
                <Stack spacing={3}>
                  <AccountPreferencesCard
                    initialEmailOptIn={emailOptIn}
                    onSave={handleSavePreferences}
                  />

                  <ManageSubscriptionCard subscription={subscription} />

                  <DeleteAccountCard />
                </Stack>
              )}
            </Stack>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export default SettingsPage;
