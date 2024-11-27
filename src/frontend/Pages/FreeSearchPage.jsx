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

const FreeSearchPage = () => {
  const defaultTheme = createTheme();
  const [SearchResults, setSearchResults] = useState([]);
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

  return <Box></Box>;
};

export default FreeSearchPage;
