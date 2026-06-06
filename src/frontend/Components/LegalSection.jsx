import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import { motion } from "framer-motion";

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
        mb: 4,
        p: { xs: 2.5, md: 3 },
        borderRadius: 3,
        backgroundColor: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(64, 224, 208, 0.16)",
        backdropFilter: "blur(6px)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "turquoise", fontWeight: 700, mb: 1 }}
      >
        {number}. {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{ color: "rgba(255,255,255,0.88)", lineHeight: 1.8 }}
      >
        {children}
      </Typography>

      <Divider sx={{ mt: 3, borderColor: "rgba(255,255,255,0.08)" }} />
    </MotionBox>
  );
};

export default LegalSection;
