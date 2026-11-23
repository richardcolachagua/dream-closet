import { createTheme } from "@mui/material/styles";
import { colors } from "../../../shared/ui/theme/designTokens";

export const searchWorkspaceTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: colors.accent, contrastText: "#061111" },
    background: { default: colors.background, paper: colors.surface },
    text: { primary: colors.textPrimary, secondary: colors.textSecondary },
    divider: colors.border,
  },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 12,
          "&.Mui-disabled": {
            color: "#a9b6b5",
            border: "1px solid #3b4746",
          },
        },
        contained: {
          "&.Mui-disabled": { backgroundColor: "#263130", color: "#bdc8c7" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface2,
          borderRadius: 14,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.borderStrong },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.accent },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: colors.accent },
        },
      },
    },
  },
});
