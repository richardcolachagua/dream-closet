import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
  CssBaseline,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../backend/firebase";

const useSavedItems = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSavedItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const querySnapshot = await getDocs(collection(db, "saved-items"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSavedItems(items);
    } catch (error) {
      console.error("Error fetching saved items", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedItems();
  }, [fetchSavedItems]);

  return { savedItems, isLoading, fetchSavedItems, setSavedItems };
};

const SavedSearches = ({ savedSearches, onDeleteSearch }) => {
  const defaultTheme = createTheme();
  const { savedItems, isLoading, setSavedItems } = useSavedItems();
  

const handleDeleteItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, "saved-items", itemId));
    setSavedItems(savedItems.filter((item) => item.id !== itemId));
  } catch (error) {
    console.error("Error deleting saved item", error);
  }
};

if (isLoading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="content"
          alignItems="center"
          height="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
      <Box
        sx={{
          backgroundColor: "black",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "100vh",
          paddingTop: "30px",
        }}
      >
        <ThemeProvider theme={defaultTheme}>
          <CssBaseline />
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              fontWeight: "bold",
              color: "white",
              justifyContent: "center",
              display: "flex",
            }}
          >
            Your Saved Searches
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Box sx={{ width: "40%" }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  fontWeight: "bold",
                  color: "white",
                  justifyContent: "center",
                  display: "flex",
                }}
              >
                Saved Items
              </Typography>
              <Grid container spacing={2}>
                {savedItems.length > 0 ? (
                  savedItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{item.name}</Typography>
                          <Typography variant="body2">
                            {item.description}
                          </Typography>
                          <IconButton onClick={() => handleDeleteItem(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography
                      variant="body1"
                      color="white"
                      sx={{
                        mb: 3,
                        color: "white",
                        justifyContent: "center",
                        display: "flex",
                      }}
                    >
                      No saved items found.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            <Box sx={{ width: "40%" }}>
              <Typography
                variant="h5"
                sx={{ mb: 3, fontWeight: "bold", color: "white" }}
              >
                Saved Searches
              </Typography>
              <Grid container spacing={2}>
                {savedSearches.length > 0 ? (
                  savedSearches.map((search) => (
                    <Grid item xs={12} sm={6} md={4} key={search.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6">{search.query}</Typography>
                          <Typography variant="body2">
                            Date: {new Date(search.date).toLocaleDateString()}{" "}
                          </Typography>
                          <IconButton onClick={() => onDeleteSearch(search.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="white">
                      No saved searches found.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Stack>
        </ThemeProvider>
      </Box>
  );
};

export default SavedSearches;
