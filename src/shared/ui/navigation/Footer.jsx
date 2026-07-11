import React from "react";
import { Typography, Stack, Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../theme/designTokens";

const footerLinkSx = {
  textDecoration: "none",
  color: "inherit",
};

const footerTextSx = {
  fontWeight: 700,
  fontSize: { xs: "0.92rem", sm: "0.98rem" },
  color: colors.textSecondary,
  transition: "color 180ms ease, transform 180ms ease",
  "&:hover": {
    color: colors.accent,
    transform: "translateY(-1px)",
  },
};

const Footer = () => {
  const links = [
    { label: "Terms of Use", to: ROUTES.TOS || "/tospage" },
    { label: "Contact Us", to: ROUTES.CONTACT || "/contactpage" },
    { label: "Privacy Policy", to: ROUTES.PRIVACY || "/privacypolicypage" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: "auto",
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.background,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))",
        py: { xs: 3, md: 3.5 },
        px: 2,
      }}
    >
      <Stack spacing={1.75} alignItems="center">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.15, sm: 3 }}
          alignItems="center"
          justifyContent="center"
          useFlexGap
          flexWrap="wrap"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              component={RouterLink}
              to={link.to}
              underline="none"
              sx={footerLinkSx}
            >
              <Typography align="center" sx={footerTextSx}>
                {link.label}
              </Typography>
            </Link>
          ))}
        </Stack>

        <Typography
          align="center"
          sx={{
            color: colors.textMuted,
            fontWeight: 700,
            fontSize: { xs: "0.92rem", sm: "1rem" },
            letterSpacing: "0.01em",
          }}
        >
          A Sixth Sense Production
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;
