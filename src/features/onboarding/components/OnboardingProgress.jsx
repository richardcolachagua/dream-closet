import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { colors } from "../../../shared/ui/theme/designTokens";

const steps = ["Shopping preference", "Clothing categories", "Favorite brands"];

const OnboardingProgress = ({ currentStep = 0 }) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Typography
          sx={{
            color: "rgba(255,255,255,0.72)",
            fontSize: "0.88rem",
            fontWeight: 700,
          }}
        >
          Step {currentStep + 1} of {steps.length}
        </Typography>

        <Typography
          sx={{
            color: colors.accent,
            fontSize: "0.88rem",
            fontWeight: 800,
          }}
        >
          {steps[currentStep]}
        </Typography>
      </Stack>

      <Box
        sx={{
          height: 10,
          borderRadius: "999px",
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #59e6db 0%, #34cfc0 100%)",
            borderRadius: "999px",
          }}
        />
      </Box>

      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {steps.map((step, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;

          return (
            <Box
              key={step}
              sx={{
                px: 1.4,
                py: 0.8,
                borderRadius: "999px",
                border: `1px solid ${
                  active || complete
                    ? "rgba(89,230,219,0.28)"
                    : "rgba(255,255,255,0.08)"
                }`,
                backgroundColor:
                  active || complete
                    ? "rgba(89,230,219,0.10)"
                    : "rgba(255,255,255,0.04)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color:
                    active || complete
                      ? colors.accent
                      : "rgba(255,255,255,0.58)",
                }}
              >
                {step}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
};

export default OnboardingProgress;
