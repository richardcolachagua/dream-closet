import React from "react";
import { Box, Container, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { motion } from "framer-motion";
import Header from "../../frontend/Components/Headers/Header";
import Footer from "../../frontend/Components/Footer";

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top, rgba(64,224,208,0.08), transparent 28%), black",
        color: "white",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <Header />
        <CssBaseline />

        <Box sx={{ flex: 1, display: "flex", py: { xs: 4, md: 6 } }}>
          <Container maxWidth={maxWidth}>
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
      </ThemeProvider>
    </Box>
  );
};

export default AnimatedPageShell;
