import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";

const pages = ["HomePage"];

function ResponsiveAppBar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
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
