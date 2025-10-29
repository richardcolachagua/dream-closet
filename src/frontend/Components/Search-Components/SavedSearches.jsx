import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  CssBaseline,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../backend/firebase";
import { auth } from "../../../backend/firebase";

const useSavedSearches = (userId) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(true);

  const fetchSavedSearches = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoadingSearches(true);
      const q = query(
        collection(db, "saved-searches"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const searches = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedSearches(searches);
    } catch (error) {
      console.error("Error fetching saved searches", error);
    } finally {
      setIsLoadingSearches(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  return {
    savedSearches,
    isLoadingSearches,
    fetchSavedSearches,
    setSavedSearches,
  };
};

const SavedSearches = () => {
  const defaultTheme = createTheme();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const userId = currentUser?.uid;
  const {
    savedSearches,
    isLoadingSearches,
    fetchSavedSearches,
    setSavedSearches,
  } = useSavedSearches(userId);

  useEffect(() => {
    if (userId) {
      fetchSavedSearches();
    }
  }, [userId, fetchSavedSearches]);

  const handleDeleteSearch = async (searchId) => {
    try {
      await deleteDoc(doc(db, "saved-searches", searchId));
      setSavedSearches(
        savedSearches.filter((search) => search.id !== searchId)
      );
    } catch (error) {
      console.error("Error deleting saved search", error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        paddingTop: "30px",
      }}
    >
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: "bold",
            color: "white",
            justifyContent: "center",
            display: "flex",
          }}
        >
          Your Saved Searches
        </Typography>
        <Grid container spacing={2}>
          {isLoadingSearches ? (
            [1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))
          ) : savedSearches.length > 0 ? (
            savedSearches.map((search) => (
              <Grid item xs={12} sm={6} md={4} key={search.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{search.query}</Typography>
                    <Typography variant="body2">
                      Date: {new Date(search.date).toLocaleDateString()}
                    </Typography>
                    <IconButton onClick={() => handleDeleteSearch(search.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="white">
                No saved searches found.
              </Typography>
            </Grid>
          )}
        </Grid>
      </ThemeProvider>
    </Box>
  );
};

export default SavedSearches;
