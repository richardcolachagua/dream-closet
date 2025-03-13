import React, { useState, useEffect } from "react";
import { Box, Typography, Grid } from "@mui/material";
import { db, auth } from "../../../backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";

function SavedItems({ userId }) {
  const [SavedItems, setSavedItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchSavedItems(user.id);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchSavedItems = async (userId) => {
    const q = query(
      collection(db, "saved-items"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSavedItems(items);
  };

  return (
    <Box sc={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Saved Items
      </Typography>
      <Grid container spacing={2}>
        {SavedItems.map((SavedItem) => (
          <Grid item xs={12} sm={6} md={4} key={SavedItem.id}>
            <SaveForLaterButton item={SavedItem.item} userId={userId} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default SavedItems;
