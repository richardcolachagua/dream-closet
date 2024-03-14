import React, { useState } from "react";
import { Textfield, Button } from "@mui/material";

function ProfilePage({ userProfile, onUpdate }) {
  const [profile, setProfile] = useState(userProfile);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSubmit = () => {
    fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    })
      .then((response) => response.json())
      .then((data) => onUpdate(data));
  };
  return (
    <form>
      <Textfield
        name="username"
        label="Username"
        value={profile.username}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <Textfield
        name="email"
        label="Email"
        value={profile.email}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleSubmit}>
        Update Profile
      </Button>
    </form>
  );
}

export default ProfilePage;
