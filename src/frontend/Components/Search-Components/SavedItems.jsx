import { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { db } from "../../../backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";

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
        itemId: doc.data().itemId || doc.data().id,
        ...doc.data(),
      }));
      console.log("Fetched saved items:", items);
      setSavedItems(items);
    } catch (error) {
      console.error("Error fetching saved items:", error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2, color: "white" }}>
        Saved Items
      </Typography>
      <Grid container spacing={2}>
        {savedItems.length === 0 ? (
          <Typography sx={{ color: "white", mt: 2 }}>
            No saved items found.
          </Typography>
        ) : (
          savedItems.map((savedItem) => {
            console.log("Passing item to SaveForLaterButton:", savedItem);
            return (
              <Grid item xs={12} sm={6} md={4} key={savedItem.id}>
                <SaveForLaterButton item={savedItem} userId={userId} />
              </Grid>
            );
          })
        )}
      </Grid>
    </Box>
  );
}

export default SavedItems;
