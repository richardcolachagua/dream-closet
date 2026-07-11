import React from "react";
import { AppBar, Box, Toolbar, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../theme/designTokens";
import { primaryButtonSx, secondaryButtonSx } from "../theme/componentStyles";

const actionButtonSx = {
  minHeight: 44,
  px: 2.25,
  borderRadius: 2.25,
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 700,
  boxShadow: "none",
};

function PublicHeader() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        backgroundImage: "none",
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
          <RouterLink to={ROUTES.HOME} style={{ display: "inline-flex" }}>
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
              sx={{
                ...primaryButtonSx,
                ...actionButtonSx,
              }}
            >
              Login
            </Button>

            <Button
              component={RouterLink}
              to={ROUTES.SIGNUP}
              variant="outlined"
              sx={{
                ...secondaryButtonSx,
                ...actionButtonSx,
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

export default PublicHeader;
