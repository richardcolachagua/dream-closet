import { Box, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SavedSearches from "../../saved/components/SavedItemsList";
import SavedItems from "../../saved/components/SavedItemsList";
import Footer from "../../../shared/ui/navigation/Footer";
import ProfileHeader from "../../profile/components/ProfileHeader";
import { useAuth } from "../../auth/AuthContext";

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
