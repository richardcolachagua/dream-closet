import { AppBar, Box, Toolbar, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const actionButtonSx = {
  minHeight: 44,
  px: 2.25,
  borderRadius: 2,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  boxShadow: "none",
};

function Header() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "black",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <RouterLink to="/homepage" style={{ display: "inline-flex" }}>
            <Box
              component="img"
              alt="Dream Closet Logo"
              src="/assets/Logo-svg.svg"
              sx={{
                height: { xs: 40, sm: 48, md: 56 },
                width: "auto",
                display: "block",
              }}
            />
          </RouterLink>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Button
              component={RouterLink}
              to="/loginpage"
              variant="contained"
              sx={{
                ...actionButtonSx,
                backgroundColor: "turquoise",
                color: "black",
                "&:hover": {
                  backgroundColor: "#35d8cb",
                },
              }}
            >
              Login
            </Button>

            <Button
              component={RouterLink}
              to="/signuppage"
              variant="outlined"
              sx={{
                ...actionButtonSx,
                color: "white",
                borderColor: "rgba(255,255,255,0.22)",
                "&:hover": {
                  borderColor: "turquoise",
                  color: "turquoise",
                  backgroundColor: "rgba(64,224,208,0.06)",
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
