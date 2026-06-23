import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const comparisonRows = [
  {
    section: "Search access",
    items: [
      {
        feature: "Search access",
        free: "Basic",
        pro: "Unlimited",
      },
      {
        feature: "Premium search results",
        free: false,
        pro: true,
      },
      {
        feature: "Advanced filtering",
        free: "Limited",
        pro: "Full access",
      },
    ],
  },
  {
    section: "Personalization",
    items: [
      {
        feature: "Onboarding-based preferences",
        free: true,
        pro: true,
      },
      {
        feature: "AI-powered recommendations",
        free: "Coming later",
        pro: "Priority access",
      },
      {
        feature: "Saved searches and favorites",
        free: "Limited",
        pro: "Expanded",
      },
    ],
  },
  {
    section: "Membership",
    items: [
      {
        feature: "Billing portal access",
        free: false,
        pro: true,
      },
      {
        feature: "Subscription management",
        free: false,
        pro: true,
      },
      {
        feature: "Priority feature access",
        free: false,
        pro: true,
      },
    ],
  },
];

function ValueCell({ value, highlighted = false }) {
  if (value === true) {
    return (
      <CheckIcon
        sx={{
          color: highlighted ? "turquoise" : "white",
          fontSize: 20,
        }}
      />
    );
  }

  if (value === false) {
    return (
      <CloseIcon
        sx={{
          color: "rgba(255,255,255,0.34)",
          fontSize: 20,
        }}
      />
    );
  }

  return (
    <Typography
      sx={{
        color: highlighted ? "turquoise" : "rgba(255,255,255,0.86)",
        fontWeight: highlighted ? 700 : 500,
        fontSize: "0.96rem",
      }}
    >
      {value}
    </Typography>
  );
}

function PricingFeatureComparison() {
  return (
    <Box
      sx={{
        mt: { xs: 5, md: 7 },
        borderRadius: 4,
        border: "1px solid rgba(255,255,255,0.12)",
        backgroundColor: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: { xs: 2, md: 3 }, py: { xs: 2.25, md: 2.75 } }}>
        <Typography
          sx={{
            color: "white",
            fontWeight: 850,
            fontSize: { xs: "1.5rem", md: "2rem" },
            lineHeight: 1.1,
            mb: 1,
          }}
        >
          Compare plan details
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.68)",
            maxWidth: 720,
            lineHeight: 1.65,
          }}
        >
          The plan cards give the quick view. This breakdown shows what changes
          as Dream Closet expands search access, premium tools, and member
          features.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1.5fr 1fr 1fr", md: "1.7fr 1fr 1fr" },
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }} />
        <Box
          sx={{
            p: 2,
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "white", fontWeight: 800 }}>Free</Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            textAlign: "center",
            background:
              "linear-gradient(180deg, rgba(64,224,208,0.08) 0%, rgba(64,224,208,0.02) 100%)",
          }}
        >
          <Typography sx={{ color: "turquoise", fontWeight: 900 }}>
            Pro
          </Typography>
        </Box>

        {comparisonRows.map((group) => (
          <React.Fragment key={group.section}>
            <Box
              sx={{
                gridColumn: "1 / -1",
                px: 2,
                py: 1.5,
                bgcolor: "rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.74)",
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                }}
              >
                {group.section}
              </Typography>
            </Box>

            {group.items.map((item) => (
              <React.Fragment key={item.feature}>
                <Box
                  sx={{
                    p: 2,
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "white",
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.feature}
                  </Typography>
                </Box>

                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    p: 2,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center",
                  }}
                >
                  <ValueCell value={item.free} />
                </Stack>

                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    p: 2,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    textAlign: "center",
                    backgroundColor: "rgba(64,224,208,0.03)",
                  }}
                >
                  <ValueCell value={item.pro} highlighted />
                </Stack>
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default PricingFeatureComparison;
