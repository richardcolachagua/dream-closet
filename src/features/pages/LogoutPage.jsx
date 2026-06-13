import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../backend/firebase/firebase";

const LogoutPage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    error: "",
  });

  useEffect(() => {
    let active = true;

    const runLogout = async () => {
      try {
        await signOut(auth);

        if (!active) return;

        setState({ loading: false, error: "" });

        setTimeout(() => {
          if (active) {
            navigate("/homepage", { replace: true });
          }
        }, 900);
      } catch {
        if (!active) return;

        setState({
          loading: false,
          error: "We couldn’t sign you out cleanly. Please try again.",
        });
      }
    };

    runLogout();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: "black",
        minHeight: "100vh",
        px: 3,
        textAlign: "center",
      }}
    >
      <LogoutIcon
        sx={{ fontSize: 76, color: "turquoise", mb: 3, opacity: 0.85 }}
        aria-label="Logout Icon"
      />

      <Typography
        variant="h4"
        color="white"
        sx={{
          fontWeight: 700,
          mb: 2,
          fontFamily: "Helvetica Neue",
        }}
      >
        {state.loading ? "Signing you out..." : "You have been signed out"}
      </Typography>

      {state.loading && <CircularProgress sx={{ color: "turquoise", mb: 3 }} />}

      {!state.loading && !state.error && (
        <Typography
          sx={{
            color: "rgba(255,255,255,0.72)",
            mb: 3,
            maxWidth: 440,
          }}
        >
          Redirecting you back home now.
        </Typography>
      )}

      {state.error && (
        <Stack
          spacing={2}
          alignItems="center"
          sx={{ width: "100%", maxWidth: 440 }}
        >
          <Alert severity="error" sx={{ width: "100%" }}>
            {state.error}
          </Alert>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: "100%" }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/homepage", { replace: true })}
              sx={{
                minHeight: 48,
                color: "white",
                borderColor: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  borderColor: "turquoise",
                  backgroundColor: "rgba(64,224,208,0.08)",
                },
              }}
            >
              Back Home
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/loginpage", { replace: true })}
              sx={{
                minHeight: 48,
                bgcolor: "turquoise",
                color: "black",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#35d8cb" },
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};

export default LogoutPage;
