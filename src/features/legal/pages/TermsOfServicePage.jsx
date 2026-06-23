import React from "react";
import { Box, Container, Divider, Typography } from "@mui/material";
import PublicHeader from "../../shared/ui/navigation/PublicHeader";
import Footer from "../../shared/ui/navigation/Footer";

const LAST_UPDATED = "June 2026";

function TermsOfServicePage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "black", color: "white" }}>
      <PublicHeader />

      <Container
        maxWidth="md"
        sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.6rem" },
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Terms of Service
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.72)",
              mb: 1.5,
            }}
          >
            Last updated: {LAST_UPDATED}
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.7,
            }}
          >
            This page should set out the rules for using Dream Closet, including
            accounts, subscriptions, allowed use, and termination. Best
            practices recommend a dedicated terms page, linked from the footer
            and at signup. [web:96][web:102][web:105]
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.18)", mb: 4 }} />

        <TosSection
          title="Introduction"
          body={[
            "Describe Dream Closet as a clothing search and discovery service, and identify your company or entity operating it.",
            "Explain that by creating an account or using the site, users agree to these terms.",
          ]}
        />

        <TosSection
          title="Accounts and eligibility"
          body={[
            "Explain who can create an account (e.g., age and jurisdiction requirements).",
            "Mention that users must provide accurate information and keep credentials secure.",
          ]}
        />

        <TosSection
          title="Use of the service"
          body={[
            "Describe what users can do with Dream Closet: search, save items and searches, manage onboarding preferences, and subscribe to member plans.",
            "Clarify that misuse (e.g., scraping, automated abuse, or illegal use) is not allowed.",
          ]}
        />

        <TosSection
          title="Subscriptions and billing"
          body={[
            "Summarize how free vs. Pro plans work and that billing is handled through your payment provider.",
            "Explain renewals, cancellation, and that users can manage their subscriptions via the billing portal or pricing page.",
          ]}
        />

        <TosSection
          title="Content and third‑party links"
          body={[
            "Note that product links and images may come from third‑party retailers and are subject to their terms.",
            "Clarify that you are not responsible for external sites linked within search results.",
          ]}
        />

        <TosSection
          title="Termination and deletion"
          body={[
            "Explain when you may suspend or terminate accounts (e.g., for misuse) and how users can close their accounts.",
            "Connect this with the account deletion flow you plan to expose in the account center.",
          ]}
        />

        <TosSection
          title="Contact and changes"
          body={[
            "Explain how you will notify users about updates to these terms and how they can contact you with questions.",
          ]}
        />
      </Container>

      <Footer />
    </Box>
  );
}

function TosSection({ title, body }) {
  return (
    <Box sx={{ mb: 3.5 }}>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: "1.12rem",
          mb: 0.75,
        }}
      >
        {title}
      </Typography>
      {body.map((paragraph, index) => (
        <Typography
          key={index}
          sx={{
            color: "rgba(255,255,255,0.8)",
            lineHeight: 1.7,
            mb: index === body.length - 1 ? 0 : 1,
          }}
        >
          {paragraph}
        </Typography>
      ))}
    </Box>
  );
}

export default TermsOfServicePage;
