import { Box, Container, CssBaseline, Stack, Typography } from "@mui/material";
import OnboardingProgress from "./OnboardingProgress";
import { colors } from "../../../shared/ui/theme/designTokens";

export default function OnboardingLayout({
  children, title, subtitle, stepLabel, currentStep = 0,
  eyebrow = "Personalization setup",
  helperText = "You can update these preferences later in Settings.",
}) {
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", color: "white", py: { xs: 2, md: 5 },
        background: "radial-gradient(ellipse at top, rgba(89,230,219,0.09), transparent 55%), #050505" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Box sx={{ borderRadius: { xs: 3, md: 5 }, border: `1px solid ${colors.border}`,
            bgcolor: colors.backgroundElevated, boxShadow: "0 24px 70px rgba(0,0,0,0.25)",
            display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", md: "300px minmax(0,1fr)" },
            alignItems: "start" }}>
            <Box component="aside" aria-label={stepLabel || "Onboarding progress"}
              sx={{ minWidth: 0, p: { xs: 2.5, sm: 3, md: 3.5 }, alignSelf: "start",
                background: "linear-gradient(155deg, rgba(89,230,219,0.12), rgba(89,230,219,0.02))",
                borderRadius: { xs: "20px 20px 0 0", md: "36px 0 0 0" },
                borderBottom: { xs: `1px solid ${colors.border}`, md: 0 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ color: colors.accent, fontSize: "0.72rem", fontWeight: 800,
                    letterSpacing: "0.12em", textTransform: "uppercase", mb: 1.25 }}>{eyebrow}</Typography>
                  {title && <Typography component="h1" sx={{ fontSize: { xs: "1.7rem", md: "2.1rem" },
                    lineHeight: 1.15, fontWeight: 800 }}>{title}</Typography>}
                  {subtitle && <Typography sx={{ display: { xs: "none", md: "block" },
                    color: colors.textSecondary, lineHeight: 1.7, fontSize: "0.94rem", mt: 1.5 }}>{subtitle}</Typography>}
                </Box>
                <OnboardingProgress currentStep={currentStep} />
                <Box sx={{ display: { xs: "none", md: "block" }, pt: 2, borderTop: `1px solid ${colors.border}` }}>
                  <Typography sx={{ color: colors.accent, fontSize: "0.85rem", fontWeight: 700, mb: 0.75 }}>Your preferences, your choice</Typography>
                  <Typography sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.7 }}>{helperText}</Typography>
                </Box>
              </Stack>
            </Box>
            <Box component="main" sx={{ minWidth: 0, p: { xs: 2.5, sm: 3.5, md: 4.5 },
              borderLeft: { md: `1px solid ${colors.border}` } }}>
              {children}
              <Typography sx={{ display: { xs: "block", md: "none" }, color: colors.textMuted,
                fontSize: "0.85rem", lineHeight: 1.6, mt: 3 }}>{helperText}</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
