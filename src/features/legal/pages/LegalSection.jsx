import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { colors } from "../../../shared/ui/theme/designTokens";

const MotionBox = motion(Box);

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const LegalSection = ({ number, title, children }) => {
  return (
    <MotionBox
      variants={sectionVariants}
      sx={{
        mb: 3,
        p: { xs: 2.5, md: 3 },
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.025))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
      }}
    >
      <Typography
        sx={{
          color: colors.accent,
          fontWeight: 800,
          fontSize: "1.04rem",
          mb: 1,
        }}
      >
        {number}. {title}
      </Typography>

      <Typography
        sx={{
          color: colors.textSecondary,
          lineHeight: 1.8,
        }}
      >
        {children}
      </Typography>

      <Divider sx={{ mt: 2.5, borderColor: "rgba(255,255,255,0.08)" }} />
    </MotionBox>
  );
};

export default LegalSection;
