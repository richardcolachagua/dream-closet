import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  MenuItem,
  Menu,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutButton from "../Logout/LogoutButton";

function SearchPageHeader() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "black",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {/* Left side - Brand Title */}
        <Box>
          <RouterLink to="/homepage">
            <Box
              component="img"
              alt="Dream Closet Logo"
              src="/assets/Logo-svg.svg"
              sx={{
                height: { xs: 72, sm: 80, md: 88 }, // Adjust sizes as needed
                width: "auto",
                display: "block",
              }}
            />
          </RouterLink>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Button
            component={RouterLink}
            to="/SavedItemsAndSearches"
            variant="contained"
            sx={{
              backgroundColor: "turquoise",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Saved Searches
          </Button>
          <Button
            component={RouterLink}
            to="/profilepage"
            variant="contained"
            sx={{
              backgroundColor: "turquoise",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Profile
          </Button>
          <LogoutButton />
        </Box>

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="menu"
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
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElNav)}
            onClose={handleCloseNavMenu}
            PaperProps={{
              sx: {
                backgroundColor: "black",
                boxShadow: "none",
              },
            }}
          >
            <MenuItem onClick={handleCloseNavMenu} sx={{ padding: 0 }}>
              <Button
                component={RouterLink}
                to="/SavedItemsAndSearches"
                variant="contained"
                sx={{
                  backgroundColor: "turquoise",
                  fontWeight: "bold",
                  width: "100%",
                  textTransform: "none",
                }}
              >
                Saved Searches
              </Button>
            </MenuItem>
            <MenuItem onClick={handleCloseNavMenu} sx={{ padding: 0 }}>
              <Button
                component={RouterLink}
                to="/profilepage"
                variant="contained"
                sx={{
                  backgroundColor: "turquoise",
                  fontWeight: "bold",
                  width: "100%",
                  textTransform: "none",
                }}
              >
                Profile
              </Button>
            </MenuItem>
            <MenuItem onClick={handleCloseNavMenu}>
              <LogoutButton />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default SearchPageHeader;
