import React from "react";
import { Box, Container, Divider, Stack, Typography } from "@mui/material";
import PublicHeader from "../../../shared/ui/navigation/PublicHeader";
import Footer from "../../../shared/ui/navigation/Footer";
import { colors, layout } from "../../../shared/ui/theme/designTokens";
import {
  heroPanelSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const LAST_UPDATED = "July 2026";

function PrivacyPolicyPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.background,
        color: colors.textPrimary,
        backgroundImage:
          "radial-gradient(circle at top, rgba(89,230,219,0.08), transparent 30%)",
      }}
    >
      <PublicHeader />

      <Box component="main" sx={{ flex: 1 }}>
        <Container
          maxWidth={layout.pageMax}
          sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}
        >
          <Stack spacing={4}>
            <Box
              sx={{
                ...heroPanelSx,
                px: { xs: 2.5, md: 4 },
                py: { xs: 3.5, md: 4.5 },
              }}
            >
              <Stack spacing={2}>
                <Box sx={sectionEyebrowSx}>Legal</Box>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 900,
                      fontSize: { xs: "2rem", md: "2.8rem" },
                      lineHeight: 1.05,
                      mb: 1,
                    }}
                  >
                    Privacy Policy
                  </Typography>

                  <Typography
                    sx={{
                      color: colors.textMuted,
                      mb: 1.25,
                    }}
                  >
                    Last updated: {LAST_UPDATED}
                  </Typography>

                  <Typography
                    sx={{
                      color: colors.textSecondary,
                      lineHeight: 1.75,
                      maxWidth: 820,
                    }}
                  >
                    This page explains what data Dream Closet collects, how it
                    is used, when it may be shared with service providers, and
                    the choices users have around access, deletion, and account
                    settings.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.14)" }} />

            <Section
              title="Scope"
              body={[
                "This policy applies to the Dream Closet website, authenticated accounts, and related product experiences made available through the platform.",
                "It should cover data collected through account registration, onboarding preferences, search activity, saved items, saved searches, subscriptions, and support requests.",
              ]}
            />

            <Section
              title="Information we collect"
              body={[
                "Dream Closet may collect account information such as name and email address, onboarding preferences such as gender, categories, and brands, and product activity such as searches, saved items, and saved searches.",
                "The service may also collect billing-related details through payment providers, as well as analytics or device information used to understand performance, product usage, and reliability.",
              ]}
            />

            <Section
              title="How we use information"
              body={[
                "Information is used to operate search, personalize the experience, support account management, process subscriptions, and improve product quality.",
                "Dream Closet may also use aggregated or de-identified information to analyze usage patterns and guide future product decisions.",
              ]}
            />

            <Section
              title="Sharing and disclosure"
              body={[
                "Information may be shared with service providers that help operate the product, such as payment processors, analytics vendors, infrastructure providers, and support tools.",
                "Dream Closet should clearly state that it does not sell personal information and only shares data when needed to provide the service, meet legal obligations, or protect users and the platform.",
              ]}
            />

            <Section
              title="Your choices and rights"
              body={[
                "Users should be able to review and update parts of their information through account settings and profile pages.",
                "This section should also explain how users can unsubscribe from communications, manage subscriptions, and request permanent account deletion.",
              ]}
            />

            <Section
              title="Data retention and deletion"
              body={[
                "The policy should explain how long Dream Closet keeps account data, saved activity, billing-related records, and support communications.",
                "It should also describe how information is deleted or anonymized after account closure, subject to legal, fraud-prevention, or financial recordkeeping requirements.",
              ]}
            />

            <Section
              title="Contact"
              body={[
                "Users should be given a reliable way to contact Dream Closet with privacy-related questions, complaints, or requests.",
                "That contact path should align with the support email or contact page exposed elsewhere in the product.",
              ]}
            />
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

function Section({ title, body }) {
  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.12rem",
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {body.map((paragraph, index) => (
        <Typography
          key={index}
          sx={{
            color: colors.textSecondary,
            lineHeight: 1.75,
            mb: index === body.length - 1 ? 0 : 1.15,
          }}
        >
          {paragraph}
        </Typography>
      ))}
    </Box>
  );
}

export default PrivacyPolicyPage;
