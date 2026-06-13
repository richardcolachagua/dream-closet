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
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../../Components/Buttons/LogoutButton/LogoutButton";
import { navButtonSx } from "../Buttons/navButtonSx";

function ProfileSearchPageHeader() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const navButtons = [
    { label: "Saved Searches", to: "/SavedItemsAndSearches" },
    { label: "Searches", to: "/searchpage" },
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

          <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="profile-search-mobile-menu"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>

            <Menu
              id="profile-search-mobile-menu"
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              keepMounted
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
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
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ProfileSearchPageHeader;
