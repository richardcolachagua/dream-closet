import React from "react";
import { Box, CircularProgress } from "@mui/material";

const AppLoadingScreen = ({ minHeight = "100vh" }) => {
  return (
    <Box
      sx={{
        minHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "black",
      }}
    >
      <CircularProgress sx={{ color: "turquoise" }} />
    </Box>
  );
};

export default AppLoadingScreen;
