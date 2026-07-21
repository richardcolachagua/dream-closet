import React, { useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
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
import { ROUTES } from "../../../app/routes/routePaths";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const cardSx = {
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
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
        returnPath: ROUTES.SETTINGS,
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
        returnPath: ROUTES.SETTINGS,
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
      <Stack spacing={2.25}>
        <Box sx={sectionEyebrowSx}>Subscription</Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "flex-start" }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: colors.accentSoft,
                color: colors.accent,
                flexShrink: 0,
              }}
            >
              {active ? <AutoAwesomeRoundedIcon /> : <CreditCardRoundedIcon />}
            </Box>

            <Box>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.18rem",
                  mb: 0.5,
                }}
              >
                {active ? "Dream Closet Pro" : "Current plan"}
              </Typography>

              <Typography
                sx={{ color: colors.textSecondary, lineHeight: 1.72 }}
              >
                Manage your Dream Closet plan, billing details, and subscription
                changes in one place.
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={statusLabel}
            sx={{
              bgcolor: active ? colors.accentSoft : colors.surface2,
              color: active ? colors.accent : colors.textPrimary,
              fontWeight: 800,
              border: `1px solid ${
                active ? colors.accentBorder : colors.border
              }`,
            }}
          />
        </Stack>

        <Box
          sx={{
            p: 2,
            borderRadius: radius.lg,
            bgcolor: colors.surface2,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Typography
            sx={{ color: colors.textPrimary, fontWeight: 700, mb: 0.5 }}
          >
            Plan details
          </Typography>
          <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
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

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
          {active ? (
            <Button
              variant="contained"
              onClick={handleManageBilling}
              disabled={loadingPortal || !ENABLE_BILLING}
              sx={primaryButtonSx}
            >
              {loadingPortal ? "Opening billing..." : "Manage subscription"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleUpgrade}
              disabled={loadingCheckout || !ENABLE_BILLING}
              sx={primaryButtonSx}
            >
              {loadingCheckout ? "Starting checkout..." : "Upgrade to Pro"}
            </Button>
          )}

          <Button
            variant="outlined"
            href={ROUTES.PRICING}
            sx={secondaryButtonSx}
          >
            View pricing
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default ManageSubscriptionCard;
