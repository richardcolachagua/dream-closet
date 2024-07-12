import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from "@mui/material";
import SaveForLaterButton from "./SaveForLaterButton";

const SearchResults = ({ results, onSaveItem }) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
      {results.map((product, index) => (
        <Card key={index} sx={{ maxWidth: 345, m: 2 }}>
          <CardMedia
            component="img"
            height="140"
            image={product.image}
            alt={product.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
          </CardContent>
          <CardActions>
            <SaveForLaterButton
              itemId={product.id}
              onSave={() => onSaveItem(product)}
            />
          </CardActions>
        </Card>
      ))}
    </Box>
  );
};

export default SearchResults;
