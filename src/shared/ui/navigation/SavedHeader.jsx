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
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../buttons/LogoutButton.jsx";
import { useTheme } from "@mui/material/styles";
import { navButtonSx } from "../buttons/navButtonStyles.jsx";
import { ROUTES } from "../../../app/routes/routePaths";

function SavedPageHeader() {
  const theme = useTheme();
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

  const navButtons = [
    { label: "Profile", to: ROUTES.PROFILE },
    { label: "Search", to: ROUTES.SEARCH },
  ];

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
                aria-controls="mobile-nav-menu"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="mobile-nav-menu"
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                keepMounted
                sx={{
                  "& .MuiPaper-root": {
                    backgroundColor: "#0f0f0f",
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: 240,
                    mt: 1,
                  },
                }}
              >
                {navButtons.map((btn) => (
                  <MenuItem key={btn.label} onClick={handleCloseNavMenu}>
                    <Button
                      component={RouterLink}
                      to={btn.to}
                      fullWidth
                      variant="contained"
                      sx={navButtonSx}
                    >
                      {btn.label}
                    </Button>
                  </MenuItem>
                ))}

                <MenuItem onClick={handleCloseNavMenu}>
                  <LogoutButton fullWidth />
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
                variant="contained"
                sx={navButtonSx}
              >
                {btn.label}
              </Button>
            ))}
            <LogoutButton />
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default SavedPageHeader;
