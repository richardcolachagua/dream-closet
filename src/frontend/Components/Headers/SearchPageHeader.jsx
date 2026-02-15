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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../../Components/Buttons/LogoutButton/LogoutButton";
import { useTheme } from "@mui/material/styles";
import { navButtonSx } from "../Buttons/navButtonSx";

function SearchPageHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // tweak breakpoint as desired
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
          {/* Logo & Mobile Menu */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <RouterLink to="/homepage">
              <Box
                component="img"
                alt="Dream Closet Logo"
                src="/assets/Logo-svg.svg"
                sx={{ height: { xs: 40, sm: 48, md: 56 }, width: "auto" }}
              />
            </RouterLink>
            {/* Show hamburger on mobile */}
            <Box sx={{ display: { xs: "flex", md: "none" }, ml: 2 }}>
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
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ "& .MuiPaper-root": { backgroundColor: "black" } }}
              >
                {navButtons.map((btn) => (
                  <MenuItem key={btn.label} onClick={handleCloseNavMenu}>
                    <Button
                      component={RouterLink}
                      to={btn.to}
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "turquoise",
                        "&:hover": { bgcolor: "darkturquoise" },
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        justifyContent: "flex-start",
                        width: "100%",
                      }}
                    >
                      {btn.label}
                    </Button>
                  </MenuItem>
                ))}
                <MenuItem onClick={handleCloseNavMenu}>
                  <LogoutButton />
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
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
            <LogoutButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default SearchPageHeader;
