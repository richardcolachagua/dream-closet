import React, { useState, useEffect } from "react";
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
import Footer from "../../Components/Footer";
import SearchResults from "../../Components/Search-Components/SearchResults";
import Header from "../../Components/Headers/Header";
import FreeUserDescriptionInput from "../../Components/Search-Components/Searchbars/FreeUserInputDescription";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFunctions, httpsCallable } from "firebase/functions";

const FreeSearchPage = () => {
  const defaultTheme = createTheme();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [remainingSearches, setRemainingSearches] = useState(3);
  const [resetTime, setResetTime] = useState(null);
  const analytics = getAnalytics();

  const checkSearchLimit = async () => {
    setIsLoading(true);
    try {
      const functions = getFunctions();
      const result = await httpsCallable(functions, "checkSearchLimit")();
      setRemainingSearches(result.data.remainingSearches);
      setResetTime(result.data.resetTime);
    } catch (error) {
      console.error("Error checking search limit", error);
      setError("Error checking search limit. Please try again.");
    } finally {
      setIsLoading(true);
    }
  };

  useEffect(() => {
    checkSearchLimit();
  }, []);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);
    checkSearchLimit();
    logEvent(analytics, "free_search", {
      search_term: results.length > 0 ? results[0].query : "unknown",
    });
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    logEvent(analytics, "search_error", { error_message: errorMessage });
  };

  const Timer = () => {
    const [timeRemaining, setTimeRemaining] = useState("");

    useEffect(() => {
      const updateTimer = () => {
        if (resetTime) {
          const now = new Date();
          const timeDiff = new Date(resetTime) - now;
          if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor(
              (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setTimeRemaining("");
            checkSearchLimit();
          }
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 600000);
      return () => clearInterval(interval);
    }, [resetTime]);

    return timeRemaining ? (
      <Typography variant="body2" sx={{ color: "white", textAlign: "center" }}>
        Resets in: {timeRemaining}
      </Typography>
    ) : null;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        transition: "background-color 0.3s ease",
        minHeight: "100vh",
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <Header />
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
              textAlign: "center",
              mb: 2,
            }}
          >
            Try Dream Closet
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              mb: 2,
            }}
          >
            {remainingSearches} searches remaining
          </Typography>
          <Timer />
          <Box sx={{ marginTop: 2, padding: "10px" }}>
            <FreeUserDescriptionInput
              onSearchStart={handleSearchStart}
              onSearchResults={handleSearchResults}
              onSearchError={handleSearchError}
              remainingSearches={remainingSearches}
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
            {!isLoading && searchResults.length > 0 && (
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
              window.location.href = "/signuppage";
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
