export const colors = {
  background: "#000000",
  surface: "#111111",
  surfaceAlt: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.12)",
  borderStrong: "rgba(255,255,255,0.18)",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.72)",
  textMuted: "rgba(255,255,255,0.62)",
  accent: "#59e6db",
  accentHover: "#41d8cc",
  accentSoft: "rgba(89,230,219,0.16)",
};

export const buttonHeights = {
  sm: 40,
  md: 44,
  lg: 48,
};

export const primaryButtonSx = {
  minHeight: buttonHeights.md,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  bgcolor: colors.accent,
  color: "#000000",
  boxShadow: "none",
  "&:hover": {
    bgcolor: colors.accentHover,
    boxShadow: "none",
  },
};

export const secondaryButtonSx = {
  minHeight: buttonHeights.md,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  borderColor: colors.borderStrong,
  color: colors.textPrimary,
  "&:hover": {
    borderColor: colors.accent,
    color: colors.accent,
    bgcolor: "rgba(255,255,255,0.02)",
  },
};

export const ghostButtonSx = {
  minHeight: buttonHeights.md,
  px: 2,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  color: colors.textPrimary,
  "&:hover": {
    color: colors.accent,
    bgcolor: "rgba(255,255,255,0.04)",
  },
};

export const navButtonSx = {
  ...primaryButtonSx,
  minWidth: 132,
};
