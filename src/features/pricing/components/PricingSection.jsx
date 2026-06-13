import React from "react";
import { Grid, Box } from "@mui/material";
import PricingTierCard from "./PricingTierCard";

function PricingSection({
  tiers = [],
  currentPlanId,
  loadingPlanId,
  onSelectTier,
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={3}>
        {tiers.map((tier) => (
          <Grid item xs={12} md={6} key={tier.id}>
            <PricingTierCard
              tier={tier}
              isCurrent={currentPlanId === tier.id}
              loading={loadingPlanId === tier.id}
              onSelect={onSelectTier}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default PricingSection;
