import React from "react";
import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const pages = ["HomePage"];

function ResponsiveAppBar() {
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
              to={`/${page.toLowerCase()}`}
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
            to="/loginpage"
            variant="contained"
            sx={{
              marginRight: "10px",
              backgroundColor: "turquoise",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: "bold",
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            variant="outlined"
            to="/signuppage"
            sx={{
              marginRight: "10px",
              color: "white",
              textTransform: "none",
              fontSize: "15px",
              fontWeight: "bold",
              borderColor: "#0063cc",
              border: "1px solid",
              borderRadius: "5px",
            }}
          >
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ResponsiveAppBar;
