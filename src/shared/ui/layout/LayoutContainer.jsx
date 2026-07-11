import React from "react";
import { Box } from "@mui/material";
import Layout from "./Layout.tsx";
import { colors } from "../../ui/theme/designTokens";

const LayoutContainer = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: { xs: 4, md: 6 },
        bgcolor: colors.background,
        backgroundImage:
          "radial-gradient(circle at top, rgba(89,230,219,0.08), transparent 28%)",
      }}
    >
      <Layout />
    </Box>
  );
};

export default LayoutContainer;
