import React, { useMemo, useState } from "react";
import { Alert, Box, Container, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../shared/ui/navigation/PublicHeader";
import PricingSection from "../components/PricingSection";
import PricingFeatureComparison from "../components/PricingFeatureComparison";
import PricingFaq from "../components/PricingFaq";
import {
  ENABLE_BILLING,
  createCheckoutSession,
} from "../services/billingService";
import {
  getCurrentPlanId,
  PLAN_IDS,
  PRICING_PLANS,
} from "../../pricing/services/pricingPlans";
import { auth } from "../../../backend/firebase/firebase";

const PricingPage = () => {
  const [loadingPlanId, setLoadingPlanId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = useMemo(() => {
    const from = location.state?.from;
    return typeof from === "string" && from.startsWith("/")
      ? from
      : "/searchpage";
  }, [location.state]);

  const currentPlanId = getCurrentPlanId(auth.currentUser?.subscription);

  const handleSelectTier = async (tier) => {
    setError("");

    if (tier.id === PLAN_IDS.FREE) {
      navigate(returnTo, { replace: true });
      return;
    }

    if (!ENABLE_BILLING) {
      return;
    }

    if (!auth.currentUser) {
      navigate("/signuppage", {
        replace: true,
        state: { from: returnTo },
      });
      return;
    }

    setLoadingPlanId(tier.id);

    try {
      const checkoutUrl = await createCheckoutSession({ returnPath: returnTo });
      window.location.assign(checkoutUrl);
    } catch {
      setError("We couldn’t start checkout right now. Please try again.");
    } finally {
      setLoadingPlanId("");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "black" }}>
      <Header />

      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}
      >
        <Stack
          spacing={1.5}
          alignItems="center"
          sx={{ textAlign: "center", mb: 4 }}
        >
          <Typography
            sx={{
              color: "white",
              fontWeight: 900,
              fontSize: { xs: "2.4rem", md: "3.5rem" },
              lineHeight: 1.05,
            }}
          >
            Choose your Dream Closet plan
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.72)",
              maxWidth: 760,
              fontSize: { xs: "1rem", md: "1.1rem" },
            }}
          >
            Start free, then upgrade to Pro when you want broader search access,
            stronger personalization, and premium discovery tools.
          </Typography>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!ENABLE_BILLING && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Billing is currently disabled in this environment. The Pro plan is
            still shown so the UI can be reviewed before launch.
          </Alert>
        )}

        <PricingSection
          tiers={PRICING_PLANS}
          currentPlanId={currentPlanId}
          loadingPlanId={loadingPlanId}
          onSelectTier={handleSelectTier}
        />

        <PricingFeatureComparison />
        <PricingFaq />
      </Container>
    </Box>
  );
};

export default PricingPage;
