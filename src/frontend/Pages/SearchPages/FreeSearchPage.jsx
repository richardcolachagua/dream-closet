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

const FreeSearchPage = () => {
  const defaultTheme = createTheme();
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [searchCount, setSearchCount] = useState(() => {
    const savedCount = localStorage.getItem("searchCount");
    const savedTime = localStorage.getItem("lastSearchTime");
    if (savedCount && savedTime) {
      const lastSearchTime = new Date(savedTime);
      if (new Date() - lastSearchTime < 24 * 60 * 60 * 1000) {
        return parseInt(savedCount, 10);
      }
    }
    return 3;
  });

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsLoading(false);

    const newCount = searchCount - 1;
    setSearchCount(newCount);
    localStorage.setItem("searchCount", newCount.toString());
    localStorage.setItem("lastSearchTime", new Date().toISOString())

    if (newCount <= 0) {
      setShowSignUpDialog(true);
    }
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  useEffect(() => {
    const checkAndResetSearchCount = () => {
      const savedTime = localStorage.getItem("lastSearchTime");
      if (savedTime) {
        const lastSearchTime = new Date(savedTime);
        if (new Date() - lastSearchTime >= 24 * 60 * 60 * 1000) {
          setSearchCount(3);
          localStorage.setItem("searchCount", "3");
          localStorage.removeItem("lastSearchItem");
        }
      }
    };

    const interval = setInterval(checkAndResetSearchCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const Timer = () => {
    const [timeRemaining, setTimeRemaining] = useState("");

    useEffect(() => {
      const updateTimer = () => {
        const savedTime = localStorage.getItem("lastSearchTime");
        if (savedTime) {
          const lastSearchTime = new Date(savedTime);
          const timeDiff = 24 * 60 * 60 * 1000 - (new Date() - lastSearchTime);
          if (timeDiff > 0) {
            const hours = Math.floor((timeDiff / 60) * 60 * 1000);
            const minutes = Math.floor(
              (timeDiff % (60 * 60 * 1000)) / (60 * 1000)
            );
            setTimeRemaining(`${hours}h ${minutes}m`);
          } else {
            setTimeRemaining("");
          }
        } else {
          setTimeRemaining("");
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 600000);
      return () => clearInterval(interval);
    }, []);

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
              display: "flex",
              justifyContent: "center",
            }}
          >
            Try Dream Closet
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              display: "flex",
              justifyContent: "center",
              marginTop: "10px",
            }}
          >
            {searchCount} searches remaining
          </Typography>
          <Timer />
          <Box sx={{ marginTop: 2, padding: "10px" }}>
            <FreeUserDescriptionInput
              onSearchStart={handleSearchStart}
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
