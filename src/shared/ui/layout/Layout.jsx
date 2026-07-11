import { Container } from "@mui/material";
import { colors } from "../theme/designTokens";

const Layout = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: colors.background,
        color: colors.textPrimary,
        backgroundImage:
          "radial-gradient(circle at top, rgba(89,230,219,0.08), transparent 28%)",
      }}
    >
      {children}
    </Container>
  );
};

export default Layout;
