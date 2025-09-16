import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../../Components/Buttons/LogoutButton";

const LogoutPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundColor: "black",
        minHeight: "100vh",
        px: 3,
        textAlign: "center",
      }}
    >
      <LogoutIcon
        sx={{ fontSize: 80, color: "turquoise", mb: 3, opacity: 0.8 }}
        aria-label="Logout Icon"
      />
      <Typography
        variant="h4"
        color="white"
        sx={{ fontWeight: "bold", mb: 4, fontFamily: "Helvetica Neue" }}
      >
        You Have Successfully Logged Out
      </Typography>
      <Grid container spacing={2} maxWidth={400} justifyContent="center">
        <Grid item xs={12} sm={6}>
          <LogoutButton fullWidth />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/loginpage")}
            sx={{
              bgcolor: "turquoise",
              color: "black",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              "&:hover": { bgcolor: "darkturquoise" },
            }}
          >
            Back to Login
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LogoutPage;
