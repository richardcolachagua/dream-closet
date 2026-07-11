import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Container,
  useMediaQuery,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../backend/firebase/firebase";
import { useTheme } from "@mui/material/styles";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../theme/designTokens";
import {
  ghostButtonSx,
  primaryButtonSx,
  secondaryButtonSx,
} from "../theme/componentStyles";

function SavedPageHeader() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  React.useEffect(() => {
    if (!isMobile && anchorElNav) {
      setAnchorElNav(null);
    }
  }, [isMobile, anchorElNav]);

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
    { label: "Profile", to: ROUTES.PROFILE },
    { label: "Search", to: ROUTES.SEARCH },
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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

            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="open navigation menu"
                aria-controls="saved-mobile-menu"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                sx={{ color: colors.textPrimary }}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="saved-mobile-menu"
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                keepMounted
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
          </Box>

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
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default SavedPageHeader;
