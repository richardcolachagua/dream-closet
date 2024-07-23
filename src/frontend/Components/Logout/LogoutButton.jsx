import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    //clear user data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    //redirect to login page
    navigate("/login");
  };

  return (
    <Button variant="contained" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
