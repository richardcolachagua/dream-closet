import { useEffect, useState, useCallback } from "react";
import {
  Typography,
  Grid,
  Container,
  Box,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import {
  collection,
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Link as RouterLink } from "react-router-dom";
import { db } from "../../../backend/firebase";
import SavedItemCard from "./SavedItemCard";
import AppLoadingScreen from "../../feedback/AppLoadingScreen";
import { ROUTES } from "../../../routes/routePaths";
import { primaryButtonSx } from "../../Buttons/buttonStyles";

function SavedItems({ userId }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSavedItems = useCallback(async (uid) => {
    setLoading(true);
    setError("");

    try {
      const savedItemsRef = collection(db, "users", uid, "savedItems");
      const savedItemsQuery = query(
        savedItemsRef,
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(savedItemsQuery);

      const items = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setSavedItems(items);
    } catch (err) {
      console.error("Error fetching saved items:", err);
      setError("Could not load saved items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchSavedItems(userId);
  }, [userId, fetchSavedItems]);

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "users", userId, "savedItems", itemId));
      setSavedItems((items) => items.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Could not remove saved item.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{ mb: 4, fontWeight: 700, color: "white" }}
      >
        Saved Items
      </Typography>

      {loading ? (
        <AppLoadingScreen minHeight="30vh" />
      ) : error ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Alert severity="error" sx={{ width: "100%", maxWidth: 520 }}>
            {error}
          </Alert>
        </Box>
      ) : savedItems.length === 0 ? (
        <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{ color: "white", fontWeight: 700 }}
          >
            No saved items yet
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{ color: "rgba(255,255,255,0.72)", maxWidth: 520 }}
          >
            Save items from your searches to build a shortlist of pieces you
            want to revisit.
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.SEARCH}
            variant="contained"
            sx={primaryButtonSx}
          >
            Go to Search
          </Button>
        </Stack>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {savedItems.map((savedItem) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
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
                userId={userId}
                productUrl={savedItem.productUrl}
                onRemove={() => handleDeleteItem(savedItem.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default SavedItems;
