import React from "react";
import { Box, Link, Stack, Typography } from "@mui/material";
import AnimatedPageShell from "../../../shared/ui/layout/AnimatedPageShell";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  heroPanelSx,
  sectionEyebrowSx,
} from "../../../shared/ui/theme/componentStyles";

const ContactPage = () => {
  return (
    <AnimatedPageShell maxWidth="md">
      <Box
        sx={{
          ...heroPanelSx,
          px: { xs: 2.5, md: 4 },
          py: { xs: 3.5, md: 4.5 },
        }}
      >
        <Stack spacing={2.5}>
          <Box sx={sectionEyebrowSx}>Support</Box>

          <Box>
            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 900,
                fontSize: { xs: "2rem", md: "2.7rem" },
                lineHeight: 1.05,
                mb: 1,
              }}
            >
              Contact Dream Closet
            </Typography>

            <Typography
              sx={{
                color: colors.textSecondary,
                lineHeight: 1.75,
                maxWidth: 720,
              }}
            >
              Reach out with product questions, billing issues, account help, or
              partnership inquiries. We’ll use this page as the primary support
              contact surface until a full help center is live.
            </Typography>
          </Box>

          <Box
            sx={{
              p: { xs: 2.25, md: 2.75 },
              borderRadius: "22px",
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Typography
              sx={{
                color: colors.textMuted,
                fontSize: "0.88rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 800,
                mb: 1,
              }}
            >
              Email
            </Typography>

            <Link
              href="mailto:richardcwebdev@gmail.com"
              underline="none"
              sx={{
                color: colors.accent,
                fontWeight: 800,
                fontSize: { xs: "1rem", md: "1.08rem" },
                wordBreak: "break-word",
              }}
            >
              richardcwebdev@gmail.com
            </Link>

            <Typography
              sx={{
                color: colors.textSecondary,
                lineHeight: 1.7,
                mt: 1.25,
              }}
            >
              For the best response time, include the email address tied to your
              account and a short description of the issue.
            </Typography>
          </Box>
        </Stack>
      </Box>
    </AnimatedPageShell>
  );
};

export default ContactPage;
