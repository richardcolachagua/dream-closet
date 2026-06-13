import React, { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ENABLE_BILLING,
  createCustomerPortalSession,
} from "../../pricing/services/billingService";

function SubscriptionStatusCard({ subscription }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isActive = subscription?.status === "active";

  const handleManageBilling = async () => {
    if (!ENABLE_BILLING || !isActive) {
      navigate("/pricing");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const portalUrl = await createCustomerPortalSession({
        returnPath: "/profilepage",
      });
      window.location.assign(portalUrl);
    } catch {
      setError("We couldn’t open billing right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.03)",
        p: 3,
      }}
    >
      <Stack spacing={1.5}>
        <Typography variant="h5" sx={{ color: "white", fontWeight: 800 }}>
          Subscription
        </Typography>
        <Typography
          sx={{ color: isActive ? "turquoise" : "rgba(255,255,255,0.72)" }}
        >
          {isActive
            ? "Dream Closet Pro is active"
            : "You are currently on the Free plan"}
        </Typography>
        {subscription?.currentPeriodEnd && (
          <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
            Current period ends on{" "}
            {new Date(
              subscription.currentPeriodEnd * 1000,
            ).toLocaleDateString()}
            .
          </Typography>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          onClick={handleManageBilling}
          disabled={loading}
          sx={{
            alignSelf: "flex-start",
            mt: 1,
            bgcolor: "turquoise",
            color: "black",
            fontWeight: 800,
            textTransform: "none",
            borderRadius: "16px",
            "&:hover": { bgcolor: "#35d8cb" },
          }}
        >
          {loading ? "Opening..." : isActive ? "Manage billing" : "View plans"}
        </Button>
      </Stack>
    </Box>
  );
}

export default SubscriptionStatusCard;
