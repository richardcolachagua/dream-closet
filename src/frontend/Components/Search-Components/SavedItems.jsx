import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
} from "@mui/material";
import { db } from "../../../backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";

const cardHover = {
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "14px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  "&:hover": {
    boxShadow: "0 6px 20px rgba(36,175,255,0.3)",
    transform: "translateY(-6px) scale(1.04)",
    backgroundColor: "#232323",
    BorderColor: "#30e3ca",
    color: "#30e3ca",
  },
};

function SavedItems({ userId }) {
  const [savedItems, setSavedItems] = useState([]);

  console.log("SavedItems component received userId:", userId);

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
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      <Typography
        variant="h4"
        align="center"
        sx={{
          mb: 4,
          fontWeight: "bold",
          color: "white",
        }}
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
              <Card sx={cardHover}>
                {savedItem.imageUrl && (
                  <CardMedia
                    component="img"
                    image={savedItem.imageUrl}
                    alt={savedItem.name}
                    sx={{
                      objectFit: "cover",
                      height: 230,
                      borderRadius: "10px 10px 0 0",
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
                    {savedItem.name}
                  </Typography>
                  {savedItem.price && (
                    <Typography variant="body2" sx={{ color: "#bbb", mb: 2 }}>
                      {savedItem.price}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: "#aaa", fontSize: 14, mb: 1 }}
                  >
                    Source: {savedItem.source}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <SaveForLaterButton item={savedItem} userId={userId} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default SavedItems;
