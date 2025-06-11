import { AppBar, Box, Toolbar, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LogoutButton from "../Logout/LogoutButton";

function SearchPageHeader() {
  return (
    <AppBar
      position="relative"
      sx={{
        backgroundColor: "black",
        width: "100%",
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
                height: { xs: 40, sm: 48, md: 56 },
                width: "auto",
              }}
            />
          </RouterLink>
        </Box>

        <Box sx={{}}>
          <Button
            component={RouterLink}
            to="/SavedItemsAndSearches"
            variant="contained"
            sx={{
              backgroundColor: "turquoise",
              fontWeight: "bold",
              textTransform: "none",
              marginRight: "10px",
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
              fontWeight: "bold",
              textTransform: "none",
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
