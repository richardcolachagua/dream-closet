import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../backend/firebase";
import { navButtonSx } from "../../../frontend/Components/Buttons/navButtonSx";

const LogoutButton = ({ fullWidth = false, onLoggedOut }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      if (typeof onLoggedOut === "function") {
        onLoggedOut();
        return;
      }

      navigate("/logoutpage", { replace: true });
    } catch {
      navigate("/logoutpage", { replace: true });
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
