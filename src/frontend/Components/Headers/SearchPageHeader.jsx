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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../Logout/LogoutButton";

function SearchPageHeader() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const navButtons = [
    { label: "Profile", to: "/profilepage" },
    { label: "Saved Searches", to: "/SavedItemsAndSearches" },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Logo - Left Side */}
          <Box>
            <RouterLink to="/homepage">
              <Box
                component="img"
                alt="Dream Closet Logo"
                src="/assets/Logo-svg.svg"
                sx={{
                  height: { xs: 40, sm: 48, md: 56 },
                  width: "auto",
                }}
              />
            </RouterLink>
          </Box>

          {/* Desktop Navigation - Right Side */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: "10px",
            }}
          >
            {navButtons.map((btn) => (
              <Button
                key={btn.label}
                component={RouterLink}
                to={btn.to}
                variant="contained"
                sx={{
                  backgroundColor: "turquoise",
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                {btn.label}
              </Button>
            ))}
            <LogoutButton />
          </Box>

          {/* Mobile Menu - Right Side */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              ml: "auto", // Pushes menu to far right
            }}
          >
            <IconButton
              size="large"
              aria-label="mobile menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                "& .MuiPaper-root": { backgroundColor: "black" },
              }}
            >
              {navButtons.map((btn) => (
                <MenuItem key={btn.label} onClick={handleCloseNavMenu}>
                  <Button
                    component={RouterLink}
                    to={btn.to}
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: "turquoise",
                      fontWeight: "bold",
                      textTransform: "none",
                    }}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default SearchPageHeader;
