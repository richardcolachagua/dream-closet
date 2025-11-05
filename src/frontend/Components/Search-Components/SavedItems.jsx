import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Container,
  Button,
} from "@mui/material";
import { db } from "../../../backend/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";

const cardHover = {
  transition: "transform 0.2s, box-shadow 0.2s",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "14px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
  "&:hover": {
    boxShadow: "0 8px 28px rgba(36,175,255,0.18)",
    transform: "translateY(-8px) scale(1.05)",
    backgroundColor: "#232323",
    borderColor: "#30e3ca",
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
                      width: "100%",
                      height: "60%",
                      objectFit: "cover",
                      borderRadius: "12px 12px 0 0",
                    }}
                  />
                )}
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ color: "#fff", mb: 1, fontWeight: "bold" }}
                  >
                    {savedItem.name}
                  </Typography>
                  {savedItem.price && (
                    <Typography variant="body2" sx={{ color: "#bbb", mb: 1 }}>
                      {savedItem.price}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{ color: "#aaa", fontSize: 14, mb: 1 }}
                  >
                    Source: {savedItem.source}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, py: 1 }}
                >
                  <SaveForLaterButton item={savedItem} userId={userId} />
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "turquoise",
                      color: "black",
                      borderRadius: 3,
                    }}
                    href={savedItem.productUrl}
                    target="_blank"
                  >
                    View Product
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default SavedItems;
