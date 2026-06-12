import React from "react";
import { AppBar, Box, Toolbar, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../routes/routePaths";
import { primaryButtonSx, secondaryButtonSx } from "../../Buttons/buttonStyles";

function Header() {
  return (
    <AppBar position="static" elevation={0} sx={{ backgroundColor: "black" }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            minHeight: 80,
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <RouterLink to={ROUTES.HOME} aria-label="Go to Dream Closet homepage">
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
              to={ROUTES.LOGIN}
              variant="contained"
              sx={primaryButtonSx}
            >
              Login
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.SIGN_UP}
              variant="outlined"
              sx={secondaryButtonSx}
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
