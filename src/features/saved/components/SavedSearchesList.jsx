import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Fade,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../backend/firebase/firebase";
import SavedSearchCard from "./SavedSearchCard";
import PageSection from "../../../shared/ui/layout/PageSection";
import {
  buildSearchStateQuery,
  DEFAULT_PAGE,
  DEFAULT_SORT,
} from "../../search/utils/searchStateHelpers";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

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
    setSavedSearches,
    fetchSavedSearches,
  };
};

function SavedSearchesList() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [justDeleted, setJustDeleted] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const userId = currentUser?.uid;
  const { savedSearches, isLoadingSearches, setSavedSearches } =
    useSavedSearches(userId);

  const hasSavedSearches = useMemo(
    () => savedSearches.length > 0,
    [savedSearches],
  );

  const handleDeleteSearch = async (searchId) => {
    try {
      await deleteDoc(doc(db, "saved-searches", searchId));
      setSavedSearches((prev) =>
        prev.filter((search) => search.id !== searchId),
      );
      setSelected((prev) => prev.filter((id) => id !== searchId));
      setJustDeleted(searchId);
      window.setTimeout(() => setJustDeleted(null), 700);
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
    <PageSection
      eyebrow="Saved searches"
      title="Searches worth coming back to"
      description="Saved searches make it easier to revisit strong ideas, compare directions, and continue shopping without starting over."
      actions={
        hasSavedSearches ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              onClick={() => navigate("/searchpage")}
              variant="contained"
              sx={primaryButtonSx}
            >
              New search
            </Button>
            {selected.length > 0 ? (
              <Button
                onClick={handleBulkDelete}
                variant="outlined"
                sx={secondaryButtonSx}
              >
                Delete {selected.length} selected
              </Button>
            ) : null}
          </Stack>
        ) : null
      }
    >
      {isLoadingSearches ? (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Box
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.surfaceSoft,
                  p: 2.5,
                }}
              >
                <Skeleton height={34} width="70%" animation="wave" />
                <Skeleton height={24} width="35%" animation="wave" />
                <Skeleton
                  height={28}
                  width="100%"
                  animation="wave"
                  sx={{ mt: 2 }}
                />
                <Skeleton height={28} width="80%" animation="wave" />
                <Skeleton
                  height={46}
                  width="100%"
                  animation="wave"
                  sx={{ mt: 2 }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : !hasSavedSearches ? (
        <Stack
          spacing={2}
          alignItems="flex-start"
          sx={{
            border: `1px solid ${colors.border}`,
            bgcolor: colors.surfaceSoft,
            borderRadius: 4,
            p: { xs: 2.5, md: 3.5 },
          }}
        >
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 800,
              fontSize: "1.1rem",
            }}
          >
            No saved searches yet.
          </Typography>
          <Typography
            sx={{
              color: colors.textSecondary,
              maxWidth: 620,
              lineHeight: 1.75,
            }}
          >
            When you save a promising search from the results page, it will
            appear here for quick reruns and comparison.
          </Typography>
          <Button
            onClick={() => navigate("/searchpage")}
            variant="contained"
            sx={primaryButtonSx}
          >
            Start searching
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={3}>
          {savedSearches.map((search) => (
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              key={search.id}
              sx={{ display: "flex" }}
            >
              <Fade in={justDeleted !== search.id}>
                <Box sx={{ width: "100%" }}>
                  <SavedSearchCard
                    query={search.query}
                    date={
                      search.date
                        ? new Date(search.date).toLocaleDateString()
                        : null
                    }
                    filters={search.filters}
                    sort={search.sort || "relevance"}
                    page={search.page || 1}
                    onDelete={() => handleDeleteSearch(search.id)}
                    onClick={() => handleRunSavedSearch(search)}
                    selected={selected.includes(search.id)}
                    onSelect={() => handleToggleSelect(search.id)}
                  />
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}
    </PageSection>
  );
}

export default SavedSearchesList;
