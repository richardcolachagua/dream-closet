import React from "react";
import { Box, Container, Divider, Typography } from "@mui/material";
import PublicHeader from "../../shared/ui/navigation/PublicHeader";
import Footer from "../../shared/ui/navigation/Footer";

const LAST_UPDATED = "June 2026";

function PrivacyPolicyPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "black", color: "white" }}>
      <PublicHeader />

      <Container
        maxWidth="md"
        sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 6, md: 8 } }}
      >
        {/* Intro */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", md: "2.6rem" },
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            Privacy Policy
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
            This page should explain what data Dream Closet collects, how it’s
            used, and the choices users have. Best practices recommend a clear
            summary up top, readable sections, and a last-updated date.
            [web:95][web:98][web:104]
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.18)", mb: 4 }} />

        {/* Example sections – replace with actual legal content */}
        <Section
          title="Scope"
          body={[
            "Describe that this policy applies to the Dream Closet website and application, including registered accounts and visitors.",
            "Clarify whether it covers data collected through onboarding flows, search activity, saved items and searches, subscriptions, and support requests.",
          ]}
        />

        <Section
          title="Information we collect"
          body={[
            "Explain the types of personal data you collect, such as account information (name, email), onboarding preferences (gender, categories, brands), search and saved-item activity, and subscription data.",
            "Note if you collect usage analytics, device information, or approximate location, and why.",
          ]}
        />

        <Section
          title="How we use information"
          body={[
            "Summarize that data is used to power search, save searches and items, personalize results, manage subscriptions, and improve the product.",
            "Mention that you may use aggregated or anonymized data to understand product usage patterns.",
          ]}
        />

        <Section
          title="Sharing and disclosure"
          body={[
            "Indicate whether you share data with payment processors (e.g., Stripe), analytics providers, or other service providers, subject to appropriate safeguards.",
            "Clarify that you don’t sell personal data and that you only share it when necessary to provide the service or comply with the law.",
          ]}
        />

        <Section
          title="Your choices and rights"
          body={[
            "Explain how users can access and update their information (e.g., via their profile or account center).",
            "Include how users can unsubscribe from communications and request account deletion, aligning with the flows you plan to build.",
          ]}
        />

        <Section
          title="Data retention and deletion"
          body={[
            "Describe how long you retain account and usage data and how it is deleted when users close their accounts.",
            "Mention that once an account is deleted, related personal data is removed or anonymized, subject to legal retention requirements.",
          ]}
        />

        <Section
          title="Contact"
          body={[
            "Provide a contact method (email or form) for privacy questions and complaints.",
            "Briefly mention how you will respond and in what timeframe.",
          ]}
        />
      </Container>

      <Footer />
    </Box>
  );
}

function Section({ title, body }) {
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

export default PrivacyPolicyPage;
