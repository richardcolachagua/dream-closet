import { Container } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        backgroundImage: `url(/assets/black_technology_gradient.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {children}
    </Container>
  );
};

export default Layout;
