import React, { useState } from "react";
import UserDescriptionInput from "../Components/Search-Components/UserInputDescription";
import SearchResults from "../Components/Search-Components/SearchResults";
import Footer from "../Components/Footer";
import SearchPageHeader from "../Components/Headers/SearchPageHeader";
import {
  Box,
  Typography,
  CssBaseline,
  Container,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const SearchPage = () => {
  const defaultTheme = createTheme();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (ErrorMessage) => {
    setError(ErrorMessage);
    setIsLoading(false);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <SearchPageHeader />
      <CssBaseline />
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            transition: "background-color 0.3s ease",
            minHeight: "100vh",
            backgroundColor: "black",
          }}
        >
          <Box
            sx={{
              padding: "50px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            >
              Personalized Recommendations
            </Typography>
          </Box>
          <Box
            sx={{
              padding: "50px",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "white",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "center",
              }}
            >
              What are we looking for today?
            </Typography>
            <UserDescriptionInput
              onSearchStart={handleSearchStart}
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
            />
          </Box>

          {isLoading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 4,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!isLoading && searchResults.length > 0 && (
            <SearchResults results={searchResults} />
          )}
        </Box>
      </Container>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
      <Footer />
    </ThemeProvider>
  );
};

export default SearchPage;
