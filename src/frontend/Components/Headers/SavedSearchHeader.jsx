import React from "react";
import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../Logout/LogoutButton";

const pages = ["Dream Closet"];

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
        <Box sx={{ display: "flex" }}>
          {pages.map((page, index) => (
            <Button
              key={index}
              component={RouterLink}
              to="/homepage"
              sx={{
                marginRight: "10px",
                color: "white",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: "bold",
              }}
            >
              {page}
            </Button>
          ))}
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
