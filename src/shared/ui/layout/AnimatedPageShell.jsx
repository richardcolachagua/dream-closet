import React from "react";
import { Box, Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import Header from "../../ui/navigation/PublicHeader";
import Footer from "../../ui/navigation/Footer";
import { colors, layout, spacing } from "../theme/designTokens";

const defaultTheme = createTheme();
const MotionBox = motion(Box);

const pageVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
};

const AnimatedPageShell = ({ children, maxWidth = "md" }) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

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
        <Header />

        <Box component="main" sx={{ flex: 1, py: spacing.section }}>
          <Container maxWidth={maxWidth === "page" ? layout.pageMax : maxWidth}>
            <MotionBox
              variants={pageVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </MotionBox>
          </Container>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default AnimatedPageShell;
