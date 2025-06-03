import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const pages = ["HomePage"];

function Header() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "black" }}>
      <Toolbar
        sx={{
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {pages.map((page, index) => (
            <Button
              key={index}
              component={RouterLink}
              to={`/${page.toLowerCase()}`}
              sx={{
                color: "white",
                textTransform: "none",
                fontSize: "15px",
                fontWeight: "bold",
                borderColor: "#0063cc",
                border: "1px solid",
                borderRadius: "5px",
              }}
            >
              {page}
            </Button>
          ))}
        </Box>
        <Box>
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
              color: "black",
            }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            variant="outlined"
            to="/signuppage"
            sx={{
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

export default Header;
