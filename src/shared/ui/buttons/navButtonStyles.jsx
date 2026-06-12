export const primaryButtonSx = {
  minHeight: 48,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  bgcolor: "turquoise",
  color: "black",
  "&:hover": {
    bgcolor: "#35d8cb",
  },
};

export const secondaryButtonSx = {
  minHeight: 48,
  px: 2.5,
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  borderColor: "rgba(255,255,255,0.2)",
  color: "white",
};

export const navButtonSx = {
  ...primaryButtonSx,
  minWidth: 110,
  whiteSpace: "nowrap",
};
