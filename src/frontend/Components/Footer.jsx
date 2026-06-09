import React from "react";
import {
  Typography,
  Stack,
  Box,
  Link as MuiLink,
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../routes/routePaths";

const footerLinks = [
  { label: "Terms of Use", to: ROUTES.TERMS },
  { label: "Contact Us", to: ROUTES.CONTACT },
  { label: "Privacy Policy", to: ROUTES.PRIVACY },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "black",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.25, sm: 4 }}
            alignItems="center"
            justifyContent="center"
          >
            {footerLinks.map((link) => (
              <MuiLink
                key={link.label}
                component={RouterLink}
                to={link.to}
                underline="none"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                  "&:hover": {
                    color: "#59e6db",
                  },
                }}
              >
                {link.label}
              </MuiLink>
            ))}
          </Stack>

          <Typography
            variant="body1"
            align="center"
            sx={{
              color: "white",
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            A Sixth Sense Production
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
