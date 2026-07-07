import React, { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  ENABLE_BILLING,
} from "../../billing/services/billingService";
import {
  formatSubscriptionStatus,
  getSubscriptionCallout,
  hasActiveSubscription,
} from "../../billing/utils/subscriptionHelpers";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

const cardSx = {
  borderRadius: radius.xl,
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
  px: { xs: 2.25, sm: 3 },
  py: { xs: 2.25, sm: 3 },
};

function ManageSubscriptionCard({ subscription }) {
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState("");

  const active = useMemo(
    () => hasActiveSubscription(subscription),
    [subscription],
  );

  const statusLabel = useMemo(
    () => formatSubscriptionStatus(subscription?.status),
    [subscription],
  );

  const callout = useMemo(
    () => getSubscriptionCallout(subscription),
    [subscription],
  );

  const handleManageBilling = async () => {
    setError("");
    setLoadingPortal(true);

    try {
      const url = await createCustomerPortalSession({
        returnPath: "/settingspage",
      });
      window.location.assign(url);
    } catch (err) {
      setError(
        err?.message ||
          "We couldn’t open billing management right now. Please try again.",
      );
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleUpgrade = async () => {
    setError("");
    setLoadingCheckout(true);

    try {
      const url = await createCheckoutSession({
        returnPath: "/settingspage",
      });
      window.location.assign(url);
    } catch (err) {
      setError(
        err?.message ||
          "We couldn’t start checkout right now. Please try again.",
      );
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <Box sx={cardSx}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography
              sx={{
                color: "white",
                fontWeight: 800,
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              Subscription
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
              Manage your Dream Closet plan, billing details, and cancellation
              flow.
            </Typography>
          </Box>

          <Chip
            label={statusLabel}
            sx={{
              backgroundColor: active
                ? "rgba(89,230,219,0.16)"
                : "rgba(255,255,255,0.08)",
              color: active ? colors.accent : "white",
              fontWeight: 700,
              border: `1px solid ${active ? "rgba(89,230,219,0.3)" : "rgba(255,255,255,0.08)"}`,
            }}
          />
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: radius.lg,
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <Typography sx={{ color: "white", fontWeight: 700, mb: 0.5 }}>
            Current plan
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.72)" }}>
            {callout}
          </Typography>
        </Box>

        {!ENABLE_BILLING ? (
          <Alert severity="info" sx={{ borderRadius: radius.md }}>
            Billing is currently disabled in this environment.
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ borderRadius: radius.md }}>
            {error}
          </Alert>
        ) : null}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {active ? (
            <Button
              variant="contained"
              onClick={handleManageBilling}
              disabled={loadingPortal || !ENABLE_BILLING}
              sx={{
                minHeight: 46,
                borderRadius: radius.md,
                textTransform: "none",
                fontWeight: 800,
                backgroundColor: colors.accent,
                color: "#000",
                "&:hover": {
                  backgroundColor: colors.accentHover,
                },
              }}
            >
              {loadingPortal ? "Opening billing..." : "Manage subscription"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleUpgrade}
              disabled={loadingCheckout || !ENABLE_BILLING}
              sx={{
                minHeight: 46,
                borderRadius: radius.md,
                textTransform: "none",
                fontWeight: 800,
                backgroundColor: colors.accent,
                color: "#000",
                "&:hover": {
                  backgroundColor: colors.accentHover,
                },
              }}
            >
              {loadingCheckout ? "Starting checkout..." : "Upgrade to Pro"}
            </Button>
          )}

          <Button
            variant="outlined"
            href="/pricing"
            sx={{
              minHeight: 46,
              borderRadius: radius.md,
              textTransform: "none",
              fontWeight: 800,
              color: "white",
              borderColor: "rgba(255,255,255,0.18)",
              "&:hover": {
                borderColor: colors.accent,
                backgroundColor: "rgba(89,230,219,0.06)",
              },
            }}
          >
            View pricing
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default ManageSubscriptionCard;
