import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Container,
  Alert,
  Stack,
} from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../../../backend/firebase";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Components/Headers/Header";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" && from.startsWith("/")
      ? from
      : "/searchpage";
  }, [location.state]);

  const handleSubscribe = async () => {
    setError("");

    if (!auth.currentUser) {
      navigate("/signuppage", {
        replace: true,
        state: { from: returnTo },
      });
      return;
    }

    setLoading(true);

    try {
      const createSession = httpsCallable(functions, "createCheckoutSession");
      const result = await createSession({
        returnUrl: `${window.location.origin}${returnTo}`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      const checkoutUrl = result?.data?.url;

      if (!checkoutUrl || typeof checkoutUrl !== "string") {
        throw new Error("Missing checkout URL.");
      }

      window.location.assign(checkoutUrl);
    } catch {
      setError("We couldn’t start checkout right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "black" }}>
      <Header />

      <Container maxWidth="sm" sx={{ pt: 10, textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: "bold", mb: 2 }}
        >
          Dream Closet Pro
        </Typography>

        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
          Unlimited searches, AI-powered style matching, and saved closet
          collections.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
            {error}
          </Alert>
        )}

        <Box
          sx={{
            border: "1px solid turquoise",
            borderRadius: 3,
            p: 4,
            backgroundColor: "rgba(255,255,255,0.02)",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <Typography
              variant="h4"
              sx={{ color: "turquoise", fontWeight: "bold" }}
            >
              $9.99 / month
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.75)", maxWidth: 420 }}>
              Upgrade for full access to Dream Closet’s premium search and
              personalization experience.
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleSubscribe}
              disabled={loading}
              sx={{
                mt: 1,
                backgroundColor: "turquoise",
                color: "black",
                borderRadius: "20px",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "18px",
                minHeight: 48,
                minWidth: 220,
                "&:hover": {
                  backgroundColor: "darkturquoise",
                },
              }}
            >
              {loading ? "Redirecting..." : "Subscribe Now"}
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingPage;
