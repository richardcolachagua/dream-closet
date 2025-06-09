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

      navigate("/loginpage");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: "turquoise",
        fontSize: { xs: "0.7rem", sm: "2rem" },
        textAlign: "center",
        fontWeight: "bold",
      }}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
