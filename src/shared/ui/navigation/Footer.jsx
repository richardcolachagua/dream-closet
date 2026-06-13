import { Typography, Stack, Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const footerLinkSx = {
  textDecoration: "none",
  color: "inherit",
};

const footerTextSx = {
  fontWeight: 700,
  fontFamily: "Helvetica Neue",
  fontSize: { xs: "0.95rem", sm: "1rem" },
};

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backgroundColor: "black",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        py: 3,
        px: 2,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.25, sm: 4 }}
        alignItems="center"
        justifyContent="center"
        sx={{ mb: 1.5 }}
      >
        <RouterLink to="/tospage" style={footerLinkSx}>
          <Typography align="center" sx={footerTextSx}>
            Terms of Use
          </Typography>
        </RouterLink>

        <RouterLink to="/contactpage" style={footerLinkSx}>
          <Typography align="center" sx={footerTextSx}>
            Contact Us
          </Typography>
        </RouterLink>

        <RouterLink to="/privacypolicypage" style={footerLinkSx}>
          <Typography align="center" sx={footerTextSx}>
            Privacy Policy
          </Typography>
        </RouterLink>
      </Stack>

      <Typography
        align="center"
        sx={{
          color: "white",
          fontWeight: 700,
          fontFamily: "Helvetica Neue",
          fontSize: { xs: "1rem", sm: "1.1rem" },
        }}
      >
        A Sixth Sense Production
      </Typography>
    </Box>
  );
};

export default Footer;
