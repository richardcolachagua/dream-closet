import React from "react";
import { Button, Box, Typography } from "@mui/material";

const LogoutPage = () => {
  return (
    <Box
      justifyContent="center"
      alignItems="center"
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
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "white", marginBottom: "20px" }}
        >
          You have successfully logged out
        </Typography>
        <Box>
          <Button
            variant="contained"
            sx={{
              borderRadius: "30px",
              backgroundColor: "black",
              marginRight: "50px",
            }}
          >
            Home
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: "30px",
              backgroundColor: "black",
              marginLeft: "100px",
            }}
          >
            Back to Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LogoutPage;
