import React from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Button,
} from "@mui/material";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";

const SearchResults = ({ results, onSaveItem }) => {
  if (!results || results.length === 0) {
    return (
      <Typography
        sx={{
          color: "white",
          fontWeight: "bold",
        }}
      >
        No results found
      </Typography>
    );
  }
  return (
   <Grid container spacing={2} justifyContent="center">
    {results.map((product) => (
      <Grid item xs={12} sm={6} md={4} key={product.id}>
        <Card sx={{ display: "flex", flexDirection: "column"}}>
      <CardMedia 
      component="img"
      image={`https://${product.imageUrl}`}
      alt={product.name}
      sx={{
        objectFit: "cover",
        width: "100%", 
        height: "100%",
        flexGrow: 1
      }}
      />
      <CardContent sx={{ flexGrow: 1}}>
      <Typography gutterBottom variant="h6" component="div" sx={{
        fontWeight:"bold"
      }}>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{
        fontWeight: "bold"
      }}>
        {product.price.current.text}
      </Typography>
      </CardContent>
      <CardActions sx={{
        justifyContent: "center"
      }}>
        <SaveForLaterButton 
        itemId={product.id}
        onSave={() => onSaveItem(product)}
        />
        <Button size="small" variant="contained" sx={{ fontWeight: "bold",
          backgroundColor: "turquoise", color: "black"
        }} href={`https://www.asos.com/${product.url}`} target="_blank">
      View on ASOS
        </Button>
      </CardActions>
        </Card>
        </Grid>
    ))}
   </Grid>
  );
};

export default SearchResults;
