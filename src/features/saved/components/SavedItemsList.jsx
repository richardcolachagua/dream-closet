import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Container,
  Box,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  query,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  collection,
} from "firebase/firestore";
import { Link as RouterLink } from "react-router-dom";
import { db } from "../../../backend/firebase/firebase";
import SavedItemCard from "../../saved/components/SavedItemCard";

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
        sx={{ mb: 4, fontWeight: 700, color: "white" }}
      >
        Saved Items
      </Typography>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Skeleton variant="rectangular" height={260} animation="wave" />
                <Box sx={{ p: 2 }}>
                  <Skeleton width="70%" height={30} animation="wave" />
                  <Skeleton width="45%" height={24} animation="wave" />
                  <Skeleton width="55%" height={34} animation="wave" />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
          <Typography sx={{ color: "white" }} align="center">
            {error}
          </Typography>

          <Button
            onClick={() => fetchSavedItems(userId)}
            variant="outlined"
            sx={{
              color: "turquoise",
              borderColor: "turquoise",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                borderColor: "#35d8cb",
                backgroundColor: "rgba(64,224,208,0.05)",
              },
            }}
          >
            Try again
          </Button>
        </Stack>
      ) : savedItems.length === 0 ? (
        <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
          <Typography
            variant="h6"
            align="center"
            sx={{ color: "white", fontWeight: 700 }}
          >
            You haven’t saved any items yet.
          </Typography>

          <Typography
            align="center"
            sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 560 }}
          >
            Save pieces you love while browsing search results so you can come
            back to them later.
          </Typography>

          <Button
            component={RouterLink}
            to="/searchpage"
            variant="contained"
            sx={{
              minHeight: 44,
              px: 2.5,
              borderRadius: 2,
              bgcolor: "turquoise",
              color: "black",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#35d8cb" },
            }}
          >
            Go to search
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
