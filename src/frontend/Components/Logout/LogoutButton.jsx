import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../backend/firebase";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      //clear user data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/logoutpage");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Button
      variant="contained"
      fullWidth
      sx={{
        bgcolor: "turquoise",
        "&:hover": { bgcolor: "darkturquoise" },
        fontWeight: "bold",
        textTransform: "none",
        width: "100px",
        height: "40px",
      }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
