import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../backend/firebase/firebase";
import SavedItemCard from "./SavedItemCard";
import PageSection from "../../../shared/ui/layout/PageSection";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

function SavedItemsList({ userId }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const hasItems = useMemo(() => savedItems.length > 0, [savedItems]);

  const fetchSavedItems = async (uid) => {
    if (!uid) {
      setSavedItems([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "saved-items"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc"),
      );

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setSavedItems(items);
    } catch (err) {
      console.error("Error fetching saved items", err);
      setError("We couldn’t load your saved items right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedItems(userId);
  }, [userId]);

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "saved-items", itemId));
      setSavedItems((prev) => prev.filter((item) => item.id !== itemId));
      setSuccessMessage("Saved item removed.");
    } catch (err) {
      console.error("Error deleting saved item", err);
      setError("We couldn’t remove that saved item.");
    }
  };

  return (
    <>
      <PageSection
        eyebrow="Saved items"
        title="Pieces you wanted to revisit"
        description="Keep track of products you liked while searching so you can compare, return, and shop more intentionally."
        actions={
          hasItems ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                component={RouterLink}
                to="/searchpage"
                variant="contained"
                sx={primaryButtonSx}
              >
                Search for more
              </Button>
            </Stack>
          ) : null
        }
      >
        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Box
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.surfaceSoft,
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={300}
                    animation="wave"
                  />
                  <Box sx={{ p: 2 }}>
                    <Skeleton height={34} width="82%" animation="wave" />
                    <Skeleton height={26} width="42%" animation="wave" />
                    <Skeleton height={22} width="55%" animation="wave" />
                    <Skeleton height={48} sx={{ mt: 2 }} animation="wave" />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Stack spacing={2} alignItems="flex-start">
            <Typography sx={{ color: colors.textPrimary }}>{error}</Typography>
            <Button
              onClick={() => fetchSavedItems(userId)}
              variant="outlined"
              sx={secondaryButtonSx}
            >
              Try again
            </Button>
          </Stack>
        ) : !hasItems ? (
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
              You haven’t saved any items yet.
            </Typography>
            <Typography
              sx={{
                color: colors.textSecondary,
                maxWidth: 620,
                lineHeight: 1.75,
              }}
            >
              Save products while browsing search results and they’ll appear
              here, ready for comparison and later review.
            </Typography>
            <Button
              component={RouterLink}
              to="/searchpage"
              variant="contained"
              sx={primaryButtonSx}
            >
              Go to search
            </Button>
          </Stack>
        ) : (
          <Grid container spacing={3}>
            {savedItems.map((savedItem) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                key={savedItem.id}
                sx={{ display: "flex" }}
              >
                <SavedItemCard
                  imageUrl={savedItem.imageUrl}
                  title={savedItem.name}
                  subtitle={savedItem.price}
                  source={savedItem.source}
                  savedItem={savedItem}
                  productUrl={savedItem.productUrl}
                  onRemove={() => handleDeleteItem(savedItem.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </PageSection>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3500}
        onClose={() => setSuccessMessage("")}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default SavedItemsList;
