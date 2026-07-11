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

function TermsOfServicePage() {
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
                    Terms of Service
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
                    These terms describe the rules for using Dream Closet,
                    including account responsibilities, subscriptions, permitted
                    use, third-party retailer content, and account suspension or
                    deletion.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.14)" }} />

            <TosSection
              title="Introduction"
              body={[
                "These terms should identify Dream Closet as a clothing search and discovery platform and name the person, company, or entity operating the service.",
                "They should also explain that by accessing the site, creating an account, or using any part of the service, users agree to these terms.",
              ]}
            />

            <TosSection
              title="Accounts and eligibility"
              body={[
                "This section should explain who can create an account, including any minimum age or jurisdiction requirements.",
                "It should also make clear that users are responsible for providing accurate information and keeping their login credentials secure.",
              ]}
            />

            <TosSection
              title="Use of the service"
              body={[
                "These terms should describe the intended use of Dream Closet, including searching for products, saving items and searches, managing onboarding preferences, and using subscription features.",
                "They should also prohibit misuse such as scraping, automated abuse, fraud, unlawful conduct, or interference with the service.",
              ]}
            />

            <TosSection
              title="Subscriptions and billing"
              body={[
                "This section should explain the difference between free and paid plans, how billing is handled, and when subscriptions renew.",
                "It should also point users to the billing portal or account settings to manage plan changes, cancellations, and renewal settings.",
              ]}
            />

            <TosSection
              title="Content and third-party links"
              body={[
                "Dream Closet search results may include third-party retailer links, product images, pricing, and availability data that are ultimately controlled by external services.",
                "The terms should make clear that Dream Closet is not responsible for the content, availability, or checkout experiences offered by those third-party retailers.",
              ]}
            />

            <TosSection
              title="Termination and deletion"
              body={[
                "These terms should explain when Dream Closet may suspend or terminate accounts, including in cases of abuse, fraud, or violations of the service rules.",
                "They should also explain how users can close their accounts and how that process relates to saved data, subscriptions, and account deletion.",
              ]}
            />

            <TosSection
              title="Changes and contact"
              body={[
                "The terms should explain how users will be notified about material changes and where the updated version will be posted.",
                "They should also provide a clear contact channel for legal or account-related questions.",
              ]}
            />
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

function TosSection({ title, body }) {
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

export default TermsOfServicePage;
