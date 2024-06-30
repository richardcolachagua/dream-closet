import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";

const Searches = () => {
  return (
    <Container>
      <Typography
        variant="h2"
        sx={{ mb: 3, fontWeight: "bold", color: "white" }}
      >
        Your Saved Searches
      </Typography>
      <Box>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "bold", color: "white" }}
        >
          Saved Items
        </Typography>
      </Box>
      <Box>
        <Typography
          variant="h4"
          sx={{ mb: 3, fontWeight: "bold", color: "white" }}
        >
          Saved Searches
        </Typography>
      </Box>
    </Container>
  );
};

export default Searches;
