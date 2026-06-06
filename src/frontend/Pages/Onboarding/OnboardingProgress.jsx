import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

const steps = ["Shopping Preference", "Clothing Types", "Favorite Brands"];

const OnboardingProgress = ({ currentStep }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="body2"
        sx={{ color: "rgba(255,255,255,0.65)", textAlign: "center", mb: 2 }}
      >
        Step {currentStep + 1} of {steps.length}
      </Typography>

      <Box
        sx={{
          height: 8,
          borderRadius: "999px",
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          mb: 1.5,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, turquoise, #00b4aa)",
            borderRadius: "999px",
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{ color: "white", textAlign: "center", fontWeight: 600 }}
      >
        {steps[currentStep]}
      </Typography>
    </Box>
  );
};

export default OnboardingProgress;
