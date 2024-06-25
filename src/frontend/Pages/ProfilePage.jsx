import React from "react";
import { Box, TextField, Typography, Button } from "@mui/material";

const ProfilePage = () => {
  const handleChange = (event) => {};
  return (
    <Box>
      <Typography>Personal Information</Typography>
      <TextField
        name="First Name"
        label="First Name"
        value={profile.firstName}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        name="Last Name"
        label="Last Name"
        value={profile.lastName}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        name="email"
        label="Email"
        value={profile.email}
        onChange={handleChange}
      />
      <TextField
        name="password"
        label="Password"
        value={profile.password}
        onChange={handleChange}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Update Profile
      </Button>
    </Box>
  );
};

export default ProfilePage;
