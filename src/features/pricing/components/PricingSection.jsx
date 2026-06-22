import React from "react";
import { Box } from "@mui/material";
import PricingTierCard from "./PricingTierCard";

function PricingSection({
  tiers = [],
  currentPlanId,
  loadingPlanId,
  onSelectTier,
}) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        gap: { xs: 3, md: 4, lg: 5 },
        alignItems: "stretch",
      }}
    >
      {tiers.map((tier) => (
        <Box key={tier.id} sx={{ minWidth: 0 }}>
          <PricingTierCard
            tier={tier}
            isCurrent={currentPlanId === tier.id}
            loading={loadingPlanId === tier.id}
            onSelect={onSelectTier}
          />
        </Box>
      ))}
    </Box>
  );
}

export default PricingSection;
