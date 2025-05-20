import React from "react";
import { Button, Box, Typography } from "@mui/material";

const LogoutPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundImage: `url(/assets/backgroundImage.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
        You have Successfully logged out
      </Typography>
      <Button variant="contained">Home</Button>
      <Button variant="contained">Back to Login</Button>
    </Box>
  );
};

export default LogoutPage;
