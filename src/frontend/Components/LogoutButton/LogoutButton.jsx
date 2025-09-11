import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../backend/firebase";

const LogoutButton = ({ fullWidth = false }) => {
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
      fullWidth={fullWidth}
      sx={{
        bgcolor: "turquoise",
        "&:hover": { bgcolor: "darkturquoise" },
        fontWeight: "bold",
        fontSize: "16px",
        textTransform: "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        minWidth: 120, // Ensures all buttons are at least this width
        px: 3, // Adds even horizontal padding
        py: 1.5, // Adds even vertical padding
      }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
