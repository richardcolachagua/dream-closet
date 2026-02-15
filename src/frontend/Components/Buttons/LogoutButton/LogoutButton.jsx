import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {auth } from "../../../../backend/firebase"
import { navButtonSx } from "../navButtonSx";

const LogoutButton = ({ fullWidth = false }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      // clear user data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/logoutpage");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="contained"
      fullWidth={fullWidth}
          sx={navButtonSx}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
