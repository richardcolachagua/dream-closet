import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import LogoutButton from "../Logout/LogoutButton";

const pages = ["Dream Closet"];

function SearchPageHeader() {
  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "black", display: "flex", alignItems: "center" }}
    >
      <Toolbar
        sx={{
          width: "100%",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Box>
          {pages.map((page, index) => (
            <Button
              key={index}
              component={RouterLink}
              to="/homepage"
              sx={{
                marginRight: "10px",
                color: "white",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "2rem" },
                textAlign: "center",
              }}
            >
              {page}
            </Button>
          ))}
          <Button
            component={RouterLink}
            to="/SavedItemsAndSearches"
            variant="contained"
            sx={{
              marginRight: "10px",
              backgroundColor: "turquoise",
              fontSize: { xs: "0.7rem", sm: "2rem" },
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Saved Searches
          </Button>
          <Button
            component={RouterLink}
            to="/profilepage"
            variant="contained"
            sx={{
              marginRight: "10px",
              backgroundColor: "turquoise",
              fontSize: { xs: "0.7rem", sm: "2rem" },
              textAlign: "center",
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

export default SearchPageHeader;
