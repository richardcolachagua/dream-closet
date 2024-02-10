import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";

const pages = ["Homepage", "About", "Contactpage"];

function ResponsiveAppBar() {
  return (
    <AppBar position="static" color="transparent" sx={{ boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "space-between", padding: "0 30 px" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {pages.map((page, index) => (
            <Button
              key={index}
              component={RouterLink}
              to={`/${page.toLowerCase()}`}
              sx={{
                marginRight: "10px",
                color: "white",
                textTransform: "none",
              }}
            >
              {page}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            component={RouterLink}
            to="/login"
            sx={{ marginRight: "10px", color: "white", textTransform: "none" }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/signup"
            sx={{ color: "white", textTransform: "none" }}
          >
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
