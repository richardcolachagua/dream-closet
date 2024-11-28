import React, { useState } from "react";
import {
  Box,
  Typography,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import Footer from "../Components/Footer";
import SearchResults from "../Components/Search-Components/SearchResults";
import SearchHeader from "../Components/Headers/SearchPageHeader";
import UserDesceiptionInput from "../Components/Search-Components/SearchResults";

const FreeSearchPage = () => {
  const defaultTheme = createTheme();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);
    setSearchCount((prevCount) => prevCount + 1);
    if (searchCount >= 2) {
      setShowSignUpDialog(true);
    }
  };

  const hanldeSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };
  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return (
    <Box
      sx={{
        transition: "background-color 0.3s ease",
        minHeight: "100vh",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <SearchHeader />
        <CssBaseline />
        <Container
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            padding: "30px",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
            }}
          >
            Try Dream Closet - {3 - searchCount} searches remaining
          </Typography>
          <Box sx={{ marginTop: 2, padding: "10px" }}>
            <UserDesceiptionInput
              onSearchStart={hanldeSearchStart}
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
            />
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
            {!isLoading && SearchResults.length > 0 && (
              <SearchResults results={searchResults} />
            )}
            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={() => setError(null)}
            >
              <Alert
                onClose={() => setError(null)}
                severity="error"
                sx={{ width: "100&", color: "white" }}
              >
                {error}
              </Alert>
            </Snackbar>
          </Box>
        </Container>
        <Footer />
      </ThemeProvider>
      <Dialog
        open={showSignUpDialog}
        onClose={() => setShowSignUpDialog(false)}
      >
        <DialogTitle>Sign Up to Continue</DialogTitle>
        <DialogContent>
          <Typography>
            You've reached the limit of free searches. Sign up to continue to
            using Dream Closet.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSignUpDialog(false)}>Close</Button>
          <Button
            onClick={() => {
              "/";
            }}
          >
            Sign Up
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FreeSearchPage;
