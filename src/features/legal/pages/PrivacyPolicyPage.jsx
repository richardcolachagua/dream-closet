import React from "react";
import { Box, Chip, Typography } from "@mui/material";
import AnimatedPageShell from "../../../shared/ui/layout/AnimatedPageShell";
import LegalSection from "../../legal/pages/LegalSection";

const PrivacyPolicyPage = () => {
  return (
    <AnimatedPageShell maxWidth="md">
      <Box sx={{ mb: 4 }}>
        <Chip
          label="Privacy"
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
          Privacy Policy
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.72)", mb: 1 }}>
          Last updated: June 5, 2026
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 760 }}>
          This Privacy Policy explains what information Dream Closet collects,
          how it is used, when it may be shared, and what choices users have
          regarding their information.
        </Typography>
      </Box>

      <LegalSection number="1" title="Information We Collect">
        We may collect information you provide directly, such as account
        details, onboarding preferences, saved items, saved searches, and
        communications with us. We may also collect technical and usage data
        such as device information, browser type, pages viewed, search activity,
        and interaction events.
      </LegalSection>

      <LegalSection number="2" title="How We Use Information">
        We use information to operate and improve Dream Closet, personalize
        search and recommendations, maintain account features, analyze usage,
        secure the platform, and support users.
      </LegalSection>

      <LegalSection number="3" title="Search and Personalization Data">
        Search queries, filters, saved content, and onboarding selections may be
        used to improve relevance, tune ranking systems, power saved
        experiences, and make results more useful to you.
      </LegalSection>

      <LegalSection number="4" title="Cookies and Similar Technologies">
        We may use cookies and similar technologies for authentication,
        security, analytics, preferences, and feature performance. Browser
        settings may allow you to manage certain cookie behaviors.
      </LegalSection>

      <LegalSection number="5" title="How Information Is Shared">
        We do not sell personal information. We may share information with
        service providers, infrastructure vendors, analytics tools, payment
        processors, or legal authorities when necessary to operate the service,
        comply with law, or protect rights and safety.
      </LegalSection>

      <LegalSection number="6" title="Data Retention">
        We retain information for as long as reasonably necessary to provide the
        service, comply with legal obligations, resolve disputes, enforce
        agreements, and maintain security and business records.
      </LegalSection>

      <LegalSection number="7" title="Your Choices and Rights">
        Depending on your location, you may have rights to access, correct,
        delete, or request a copy of your personal information, or object to
        certain processing. Requests can be submitted through Dream Closet
        support channels.
      </LegalSection>

      <LegalSection number="8" title="Security">
        We use reasonable administrative, technical, and organizational
        safeguards to protect information. No method of transmission or storage
        is completely secure, so absolute security cannot be guaranteed.
      </LegalSection>

      <LegalSection number="9" title="Children’s Privacy">
        Dream Closet is not directed to children under 13, and we do not
        knowingly collect personal information from children under 13.
      </LegalSection>

      <LegalSection number="10" title="International Transfers">
        Your information may be processed in countries other than your own,
        depending on where service providers and infrastructure are located.
      </LegalSection>

      <LegalSection number="11" title="Changes to This Policy">
        We may update this Privacy Policy from time to time. When material
        changes are made, we may revise the effective date and provide
        additional notice where appropriate.
      </LegalSection>

      <LegalSection number="12" title="Contact">
        For privacy-related questions or requests, use the contact or support
        options provided through Dream Closet.
      </LegalSection>
    </AnimatedPageShell>
  );
};

export default PrivacyPolicyPage;
