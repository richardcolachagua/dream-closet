import { buttonHeights, colors, radius, shadows } from "./designTokens";

export const primaryButtonSx = {
  minHeight: buttonHeights.lg,
  px: 3,
  borderRadius: radius.md,
  textTransform: "none",
  fontSize: "0.98rem",
  fontWeight: 800,
  bgcolor: colors.accent,
  color: "#000",
  boxShadow: "none",
  "&:hover": {
    bgcolor: colors.accentHover,
    boxShadow: "none",
  },
};

export const secondaryButtonSx = {
  minHeight: buttonHeights.lg,
  px: 3,
  borderRadius: radius.md,
  textTransform: "none",
  fontSize: "0.98rem",
  fontWeight: 800,
  border: `1px solid ${colors.borderStrong}`,
  color: colors.textPrimary,
  "&:hover": {
    borderColor: colors.accent,
    color: colors.accent,
    bgcolor: colors.surfaceSoft,
  },
};

export const ghostButtonSx = {
  minHeight: buttonHeights.md,
  px: 2,
  borderRadius: radius.md,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: colors.textPrimary,
  "&:hover": {
    color: colors.accent,
    bgcolor: colors.surfaceSoft,
  },
};

export const navButtonSx = {
  ...primaryButtonSx,
  minWidth: 132,
  minHeight: buttonHeights.md,
  px: 2.5,
};

export const sectionEyebrowSx = {
  display: "inline-flex",
  alignItems: "center",
  px: 1.4,
  py: 0.75,
  borderRadius: radius.pill,
  bgcolor: colors.accentSoft,
  color: colors.accent,
  border: `1px solid ${colors.accentBorder}`,
  fontSize: "0.8rem",
  fontWeight: 800,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

export const featureCardSx = {
  height: "100%",
  borderRadius: radius.lg,
  border: `1px solid ${colors.border}`,
  bgcolor: colors.surfaceSoft,
  p: { xs: 2.5, md: 3 },
  boxShadow: shadows.card,
};

export const interactiveCardSx = {
  ...featureCardSx,
  transition:
    "transform 180ms ease, border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: colors.accentBorder,
    bgcolor: colors.surfaceSoftHover,
    boxShadow: shadows.cardHover,
  },
};

export const heroPanelSx = {
  borderRadius: radius.xl,
  border: `1px solid ${colors.border}`,
  bgcolor: "rgba(255,255,255,0.025)",
  boxShadow: shadows.card,
  backdropFilter: "blur(10px)",
};
