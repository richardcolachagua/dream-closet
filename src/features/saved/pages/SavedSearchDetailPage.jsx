import { Box, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SavedSearches from "../../Components/Search-Components/SavedSearches";
import SavedItems from "../../Components/Search-Components/SavedItems";
import Footer from "../../Components/Footer";
import ProfileHeader from "../../Components/Headers/SavedSearchHeader";
import { useAuth } from "../../../backend/AuthContext";

const defaultTheme = createTheme();

const SavedItemsAndSearches = () => {
  const { user } = useAuth();
  const userId = user?.uid;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <ProfileHeader />
        <CssBaseline />
        <SavedSearches />
        <SavedItems userId={userId} />
        <Footer />
      </ThemeProvider>
    </Box>
  );
};

export default SavedItemsAndSearches;
