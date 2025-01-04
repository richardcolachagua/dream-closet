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
import SaveForLaterButton from "./SaveForLaterButton";

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
        <Card sx={{ maxWidth: 345, height: "100%", display: "flex", flexDirection: "column"}}>
      <CardMedia 
      component="img"
      height="140"
      image={`https://${product.imageUrl}`}
      alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1}}>
      <Typography gutterBottom variant="h6" component="div">
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {product.price.current.text}
      </Typography>
      </CardContent>
      <CardActions>
        <SaveForLaterButton 
        itemId={product.id}
        onSave={() => onSaveItem(product)}
        />
        <Button size="small" href={`https://www.asos.com/${product.url}`} target="_blank">
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
