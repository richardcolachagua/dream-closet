import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import AnimatedPageShell from "../../../shared/ui/layout/AnimatedPageShell";
import LegalSection from "../../legal/pages/LegalSection";

const TOSPage = () => {
  return (
    <AnimatedPageShell maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Chip
          label="Legal"
          sx={{
            mb: 2,
            color: "black",
            bgcolor: "turquoise",
            fontWeight: 700,
          }}
        />
        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: 800, mb: 1 }}
        >
          Terms of Service
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.72)", mb: 1 }}>
          Last updated: June 5, 2026
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 760 }}>
          These Terms govern your access to and use of Dream Closet, including
          search, saved items, saved searches, personalization, and related
          features.
        </Typography>
      </Box>

      <LegalSection number="1" title="Acceptance of Terms">
        By accessing or using Dream Closet, you agree to be bound by these Terms
        of Service and any policies referenced within them. If you do not agree,
        do not use the service.
      </LegalSection>

      <LegalSection number="2" title="Service Description">
        Dream Closet helps users search for clothing and fashion products, save
        items and searches, and receive more personalized discovery experiences
        based on preferences and activity.
      </LegalSection>

      <LegalSection number="3" title="Accounts and Eligibility">
        You may need an account to use some features. You are responsible for
        maintaining the confidentiality of your credentials and for activity
        that occurs under your account.
      </LegalSection>

      <LegalSection number="4" title="Acceptable Use">
        You agree not to misuse the service, interfere with its operation,
        attempt unauthorized access, scrape protected systems, upload unlawful
        content, or use Dream Closet in a way that violates applicable law or
        third-party rights.
      </LegalSection>

      <LegalSection number="5" title="Product Information and Availability">
        Product listings, prices, availability, and images may come from
        third-party sources and can change without notice. Dream Closet does not
        guarantee that all displayed information is complete, current, or
        error-free at all times.
      </LegalSection>

      <LegalSection number="6" title="Intellectual Property">
        Dream Closet and its original content, branding, software, and site
        design are protected by intellectual property laws. You may not copy,
        modify, distribute, or exploit protected materials without permission.
      </LegalSection>

      <LegalSection number="7" title="Third-Party Services">
        The service may link to third-party merchants, payment providers, and
        other external services. Dream Closet is not responsible for the
        content, policies, or practices of those third parties.
      </LegalSection>

      <LegalSection number="8" title="Termination">
        We may suspend or terminate access to the service if you violate these
        Terms, create risk for the platform, or misuse Dream Closet in ways that
        harm users or partners.
      </LegalSection>

      <LegalSection number="9" title="Disclaimers and Limitation of Liability">
        Dream Closet is provided on an “as is” and “as available” basis. To the
        fullest extent permitted by law, we disclaim warranties and limit
        liability for indirect, incidental, special, consequential, or punitive
        damages.
      </LegalSection>

      <LegalSection number="10" title="Changes to These Terms">
        We may update these Terms from time to time. Continued use of the
        service after updated Terms become effective constitutes acceptance of
        those changes.
      </LegalSection>

      <LegalSection number="11" title="Contact">
        Questions about these Terms can be sent through the Dream Closet help or
        contact channels listed on the site.
      </LegalSection>
    </AnimatedPageShell>
  );
};

export default TOSPage;
