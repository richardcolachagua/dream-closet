import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Grid,
  Skeleton,
  Container,
  Button,
  Box,
  Fade,
} from "@mui/material";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../../backend/firebase";
import SavedSearchCard from "./Cards/SavedSearchCard";
import {
  buildSearchStateQuery,
  DEFAULT_SORT,
  DEFAULT_PAGE,
} from "../../Components/Search-Components/utils/searchStateHelpers";

const useSavedSearches = (userId) => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoadingSearches, setIsLoadingSearches] = useState(true);

  const fetchSavedSearches = useCallback(async () => {
    if (!userId) {
      setSavedSearches([]);
      setIsLoadingSearches(false);
      return;
    }

    try {
      setIsLoadingSearches(true);
      const q = query(
        collection(db, "saved-searches"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      const searches = querySnapshot.docs.map((savedDoc) => ({
        id: savedDoc.id,
        ...savedDoc.data(),
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
  const [selected, setSelected] = useState([]);
  const [justDeleted, setJustDeleted] = useState(null);

  const navigate = useNavigate();

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
      setSavedSearches((prev) =>
        prev.filter((search) => search.id !== searchId),
      );
      setSelected((prev) => prev.filter((id) => id !== searchId));
      setJustDeleted(searchId);
      setTimeout(() => setJustDeleted(null), 850);
    } catch (error) {
      console.error("Error deleting saved search", error);
    }
  };

  const handleBulkDelete = async () => {
    await Promise.all(selected.map((searchId) => handleDeleteSearch(searchId)));
    setSelected([]);
  };

  const handleToggleSelect = (id) => {
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((savedId) => savedId !== id)
        : [...prevSelected, id],
    );
  };

  const handleRunSavedSearch = (search) => {
    const searchQueryString = buildSearchStateQuery({
      query: search.query || "",
      filters: search.filters || {},
      sort: search.sort || DEFAULT_SORT,
      page: search.page || DEFAULT_PAGE,
    });

    navigate(`/searchpage${searchQueryString ? `?${searchQueryString}` : ""}`);
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

      {selected.length > 0 && (
        <Fade in={!!selected.length}>
          <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              color="error"
              variant="contained"
              onClick={handleBulkDelete}
              sx={{ borderRadius: 50, fontWeight: 700 }}
            >
              Delete {selected.length} Selected
            </Button>
          </Box>
        </Fade>
      )}

      <Grid container spacing={6} justifyContent="center">
        {isLoadingSearches ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Skeleton
                variant="rectangular"
                height={170}
                sx={{ borderRadius: 3 }}
              />
            </Grid>
          ))
        ) : savedSearches.length > 0 ? (
          savedSearches.map((search) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={search.id}>
              <Fade in={justDeleted !== search.id}>
                <div>
                  <SavedSearchCard
                    query={search.query}
                    date={
                      search.date
                        ? new Date(search.date).toLocaleDateString()
                        : null
                    }
                    filters={search.filters || {}}
                    sort={search.sort || "relevance"}
                    page={search.page || 1}
                    onDelete={() => handleDeleteSearch(search.id)}
                    onClick={() => handleRunSavedSearch(search)}
                    selected={selected.includes(search.id)}
                    onSelect={() => handleToggleSelect(search.id)}
                  />
                </div>
              </Fade>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", color: "white", mt: 6 }}>
              <Typography variant="h6" sx={{ mt: 2 }}>
                No saved searches yet!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Search for your favorite items and save a search here.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default SavedSearches;
