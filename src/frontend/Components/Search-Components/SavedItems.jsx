import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Container,
  CircularProgress,
  Box,
} from "@mui/material";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../backend/firebase";
import SavedItemCard from "./Cards/SavedItemCard";

function SavedItems({ userId }) {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    fetchSavedItems(userId);
  }, [userId]);

  const fetchSavedItems = async (uid) => {
    setLoading(true);
    setError("");

    try {
      // Recommended structure: users/{uid}/savedItems
      const savedItemsRef = collection(db, "users", uid, "savedItems");
      const q = query(savedItemsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

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
  };

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
        sx={{ mb: 4, fontWeight: "bold", color: "white" }}
      >
        Saved Items
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography sx={{ color: "white", mt: 2 }} align="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {savedItems.length === 0 ? (
            <Grid item xs={12}>
              <Typography sx={{ color: "white", mt: 2 }} align="center">
                No saved items found.
              </Typography>
            </Grid>
          ) : (
            savedItems.map((savedItem) => (
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
            ))
          )}
        </Grid>
      )}
    </Container>
  );
}

export default SavedItems;
