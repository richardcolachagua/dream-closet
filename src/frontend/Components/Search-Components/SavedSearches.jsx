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
  Container,
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

const cardHover = {
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "14px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(36,175,255,0.3)",
    transform: "translateY(-6px) scale(1.04)",
    backgroundColor: "#232323",
    borderColor: "#30e3ca",
    color: "#30e3ca",
  },
};

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
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <ThemeProvider theme={defaultTheme}>
        <CssBaseline />
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            color: "white",
            justifyContent: "center",
            display: "flex",
          }}
        >
          Your Saved Searches
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {isLoadingSearches ? (
            [1, 2, 3].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={180} />
              </Grid>
            ))
          ) : savedSearches.length > 0 ? (
            savedSearches.map((search) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={search.id}>
                <Card sx={cardHover}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                      {search.query}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#bbb", mb: 2 }}>
                      Date: {new Date(search.date).toLocaleDateString()}
                    </Typography>
                    <IconButton onClick={() => handleDeleteSearch(search.id)}>
                      <DeleteIcon sx={{ color: "#30e3ca" }} />
                    </IconButton>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" color="white" align="center">
                No saved searches found.
              </Typography>
            </Grid>
          )}
        </Grid>
      </ThemeProvider>
    </Container>
  );
};

export default SavedSearches;
