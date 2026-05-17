import React from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Grid,
  Button,
  Box,
} from "@mui/material";
import SaveForLaterButton from "./Buttons/SaveForLaterButton";
import AppliedFiltersChips from "./filters/AppliedFiltersChips";

const SearchResults = ({
  results,
  onSaveItem,
  viewMode,
  userId,
  filters,
  onRemoveFilter,
  onClearAllFilters,
}) => {
  const hasResults = results && results.length > 0;

  return (
    <Box sx={{ width: "100%" }}>
      <AppliedFiltersChips
        filters={filters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onClearAllFilters}
        resultCount={results?.length || 0}
      />

      {!hasResults ? (
        <Typography
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          No results found
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {results.map((product) => (
            <Grid
              item
              xs={viewMode === "list" ? 12 : 6}
              sm={viewMode === "list" ? 12 : 4}
              md={viewMode === "list" ? 12 : 3}
              key={product.itemId}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <CardMedia
                  component="img"
                  image={product.imageUrl || ""}
                  alt={product.name || ""}
                  sx={{
                    objectFit: "cover",
                    width: "100%",
                    height: "100%",
                    flexGrow: 1,
                  }}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontWeight: "bold",
                    }}
                  >
                    {product.price}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Source: {product.source}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: "center",
                  }}
                >
                  <SaveForLaterButton
                    item={product}
                    userId={userId}
                    source={product.source}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "turquoise",
                      color: "black",
                    }}
                    href={product.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Product
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default SearchResults;
