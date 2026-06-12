import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../backend/firebase";

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
  }, []);

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
        sx={{ fontSize: 80, color: "turquoise", mb: 3, opacity: 0.8 }}
        aria-label="Logout Icon"
      />

      <Typography
        variant="h4"
        color="white"
        sx={{ fontWeight: "bold", mb: 2, fontFamily: "Helvetica Neue" }}
      >
        {state.loading
          ? "Signing you out..."
          : "You have successfully logged out"}
      </Typography>

      {state.loading && <CircularProgress sx={{ color: "turquoise", mb: 3 }} />}

      {state.error && (
        <Alert severity="error" sx={{ mb: 3, width: "100%", maxWidth: 420 }}>
          {state.error}
        </Alert>
      )}

      {!state.loading && (
        <Grid container spacing={2} maxWidth={420} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/homepage", { replace: true })}
              sx={{
                minHeight: 48,
                color: "white",
                borderColor: "rgba(255,255,255,0.35)",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  borderColor: "turquoise",
                  backgroundColor: "rgba(64,224,208,0.08)",
                },
              }}
            >
              Back Home
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate("/loginpage", { replace: true })}
              sx={{
                minHeight: 48,
                bgcolor: "turquoise",
                color: "black",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { bgcolor: "darkturquoise" },
              }}
            >
              Back to Login
            </Button>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default LogoutPage;
