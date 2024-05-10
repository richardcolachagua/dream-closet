import React from "react";
import { Box, TextField, Typography, Button } from "@mui/material";

const ProfilePage = () => {
  return (
    <Box>
      <Typography>Personal Information</Typography>
      <TextField>First Name</TextField>
      <TextField>Last Name</TextField>
      <TextField>Email Address</TextField>
      <Button variant="contained">Update Profile</Button>
    </Box>
  );
};

export default ProfilePage;
