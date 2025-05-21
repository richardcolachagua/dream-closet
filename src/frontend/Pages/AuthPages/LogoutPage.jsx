import React from "react";
import { Button, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LogoutPage = () => {
  return (
    <Box
      justifyContent="center"
      alignItems="center"
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "white", marginBottom: "20px" }}
        >
          You Have Successfully Logged Out
        </Typography>
        <Box>
          <Button
            variant="contained"
            component={RouterLink}
            to="/homepage"
            sx={{
              borderRadius: "30px",
              backgroundColor: "turquoise",
              marginRight: "50px",
              color: "black",
              fontWeight: "bold",
            }}
          >
            Home
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to="/loginpage"
            sx={{
              borderRadius: "30px",
              backgroundColor: "turquoise",
              marginLeft: "130px",
              color: "black",
              fontWeight: "bold",
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
