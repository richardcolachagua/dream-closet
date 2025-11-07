import { useState, useEffect } from "react";
import { Typography, Grid, Container } from "@mui/material";
import { db } from "../../../backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SavedItemCard from "./Cards/SavedItemCard";

function SavedItems({ userId }) {
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchSavedItems(userId);
    }
  }, [userId]);

  const fetchSavedItems = async (userIdParam) => {
    try {
      const q = query(
        collection(db, "saved-items"),
        where("userId", "==", userIdParam)
      );
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedItems(items);
    } catch (error) {
      console.error("Error fetching saved items:", error);
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
              />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default SavedItems;
