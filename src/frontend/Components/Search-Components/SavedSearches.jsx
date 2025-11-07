import { useState, useEffect, useCallback } from "react";
import { Typography, Grid, Skeleton, Container } from "@mui/material";
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
import SavedSearchCard from "./Cards/SavedSearchCard";

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
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const userId = currentUser?.uid;
  const { savedSearches, isLoadingSearches, setSavedSearches } =
    useSavedSearches(userId);

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
        Saved Searches
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
              <SavedSearchCard
                query={search.query}
                date={
                  search.date ? new Date(search.date).toLocaleDateString() : "—"
                }
                onDelete={() => handleDeleteSearch(search.id)}
              />
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
    </Container>
  );
};

export default SavedSearches;
