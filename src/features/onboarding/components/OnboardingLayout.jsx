import React from "react";
import { Box, Container, CssBaseline, Stack, Typography } from "@mui/material";
import OnboardingProgress from "./OnboardingProgress";
import {
  colors,
  spacing,
  typography,
} from "../../../shared/ui/theme/designTokens";

const OnboardingLayout = ({
  children,
  title,
  subtitle,
  stepLabel,
  currentStep = 0,
  eyebrow = "Personalization setup",
  helperText = "You can update these preferences later in Settings.",
}) => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, rgba(89,230,219,0.14) 0%, rgba(89,230,219,0.05) 22%, rgba(0,0,0,0) 48%), linear-gradient(180deg, #050505 0%, #090909 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          py: { xs: 3, md: 5 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              maxWidth: 1040,
              mx: "auto",
              borderRadius: "28px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              boxShadow: "0 24px 80px rgba(0,0,0,0.36)",
              backdropFilter: "blur(18px)",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
                minHeight: { md: 700 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  borderRight: { md: "1px solid rgba(255,255,255,0.06)" },
                  borderBottom: {
                    xs: "1px solid rgba(255,255,255,0.06)",
                    md: "none",
                  },
                  background:
                    "linear-gradient(180deg, rgba(89,230,219,0.10) 0%, rgba(255,255,255,0.02) 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Stack spacing={3}>
                  <Box>
                    <Typography
                      sx={{
                        color: colors.accent,
                        fontSize: typography.overline || "0.78rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        mb: 1.5,
                      }}
                    >
                      {eyebrow}
                    </Typography>

                    {stepLabel ? (
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.55)",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          mb: 2,
                        }}
                      >
                        {stepLabel}
                      </Typography>
                    ) : null}

                    {title ? (
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.05,
                          fontSize: { xs: "2rem", md: "3rem" },
                          mb: subtitle ? 1.5 : 0,
                        }}
                      >
                        {title}
                      </Typography>
                    ) : null}

                    {subtitle ? (
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.72)",
                          fontSize: { xs: "0.98rem", md: "1.04rem" },
                          lineHeight: 1.7,
                          maxWidth: 460,
                        }}
                      >
                        {subtitle}
                      </Typography>
                    ) : null}
                  </Box>

                  <OnboardingProgress currentStep={currentStep} />
                </Stack>

                <Stack spacing={2.25} sx={{ mt: { xs: 4, md: 6 } }}>
                  <Box
                    sx={{
                      borderRadius: "20px",
                      p: 2.25,
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Typography
                      sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
                    >
                      Why we ask
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.68)",
                        fontSize: "0.94rem",
                        lineHeight: 1.65,
                      }}
                    >
                      Your answers help Dream Closet prioritize better search
                      results, tailor recommendations, and make the experience
                      feel more like your own closet.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      borderRadius: "20px",
                      p: 2.25,
                      backgroundColor: "rgba(89,230,219,0.08)",
                      border: "1px solid rgba(89,230,219,0.16)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: colors.accent,
                        fontWeight: 800,
                        fontSize: "0.92rem",
                        mb: 0.5,
                      }}
                    >
                      Good to know
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.78)",
                        fontSize: "0.93rem",
                        lineHeight: 1.65,
                      }}
                    >
                      {helperText}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: { xs: 3, sm: 4, md: 5 },
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box sx={{ width: "100%" }}>{children}</Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default OnboardingLayout;
