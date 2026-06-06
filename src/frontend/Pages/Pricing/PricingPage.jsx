import React, { useState } from "react";
import { Box, Button, Typography, Container } from "@mui/material";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../../backend/firebase"; // make sure functions is exported
import { auth } from "../../../backend/firebase";
import { useNavigate } from "react-router-dom";
import Header from "../../Components/Headers/Header";

const PricingPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!auth.currentUser) {
      navigate("/signuppage");
      return;
    }
    setLoading(true);
    try {
      const createSession = httpsCallable(functions, "createCheckoutSession");
      const result = await createSession();
      // Redirect to Stripe Checkout
      window.location.href = result.data.url;
    } catch (err) {
      console.error("Checkout error:", err);
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
        <Box sx={{ border: "1px solid turquoise", borderRadius: 3, p: 4 }}>
          <Typography
            variant="h4"
            sx={{ color: "turquoise", fontWeight: "bold" }}
          >
            $9.99 / month
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubscribe}
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: "turquoise",
              color: "black",
              borderRadius: "20px",
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "18px",
            }}
          >
            {loading ? "Loading..." : "Subscribe Now"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingPage;
