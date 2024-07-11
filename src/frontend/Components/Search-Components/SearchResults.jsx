import React from "react";
import { Box, Typography, Card, CardContent, CardMedia } from "@mui/material";

const SearchResults = ({ results }) => {
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
        </Card>
      ))}
    </Box>
  );
};

export default SearchResults;
