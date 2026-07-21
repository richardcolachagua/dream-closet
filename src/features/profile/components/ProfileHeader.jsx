import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Container,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../backend/firebase/firebase";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  ghostButtonSx,
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

function ProfileHeader() {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleCloseNavMenu();
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navButtons = [
    { label: "Search", to: ROUTES.SEARCH },
    { label: "Saved", to: ROUTES.SAVED },
    { label: "Settings", to: ROUTES.SETTINGS },
  ];

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

          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navButtons.map((btn) => (
              <Button
                key={btn.label}
                component={RouterLink}
                to={btn.to}
                variant="text"
                sx={ghostButtonSx}
              >
                {btn.label}
              </Button>
            ))}

            <Button
              onClick={handleLogout}
              variant="outlined"
              sx={secondaryButtonSx}
            >
              Log out
            </Button>
          </Stack>

          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="profile-mobile-menu"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{ color: colors.textPrimary }}
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="profile-mobile-menu"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              keepMounted
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              sx={{
                "& .MuiPaper-root": {
                  backgroundColor: colors.surface,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  minWidth: 240,
                  mt: 1,
                  backgroundImage: "none",
                },
              }}
            >
              {navButtons.map((btn) => (
                <MenuItem key={btn.label} onClick={handleCloseNavMenu}>
                  <Button
                    component={RouterLink}
                    to={btn.to}
                    fullWidth
                    variant="text"
                    sx={{ ...ghostButtonSx, justifyContent: "flex-start" }}
                  >
                    {btn.label}
                  </Button>
                </MenuItem>
              ))}

              <MenuItem onClick={handleLogout}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ ...primaryButtonSx, minHeight: 42 }}
                >
                  Log out
                </Button>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ProfileHeader;
