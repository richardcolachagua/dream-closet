import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../Logout/LogoutButton";

function ProfileHeader() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Toolbar
        sx={{
          width: "100%",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
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
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            component={RouterLink}
            to="/searchpage"
            variant="contained"
            sx={{
              marginRight: "10px",
              backgroundColor: "turquoise",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            Search
          </Button>
          <Button
            component={RouterLink}
            to="/profilepage"
            variant="contained"
            sx={{
              marginRight: "10px",
              backgroundColor: "turquoise",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            Profile
          </Button>
          <LogoutButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ProfileHeader;
