import { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../backend/firebase/firebase";

function LogoutButton({ fullWidth = false, sx = {} }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await signOut(auth);
      navigate("/homepage", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outlined"
      fullWidth={fullWidth}
      startIcon={
        isLoading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          <LogoutIcon />
        )
      }
      disabled={isLoading}
      sx={{
        minHeight: 44,
        px: 2.25,
        borderRadius: 2,
        textTransform: "none",
        fontSize: "0.95rem",
        fontWeight: 700,
        borderColor: "rgba(255,255,255,0.2)",
        color: "white",
        whiteSpace: "nowrap",
        "&:hover": {
          borderColor: "turquoise",
          color: "turquoise",
          backgroundColor: "rgba(64,224,208,0.06)",
        },
        "&.Mui-disabled": {
          borderColor: "rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.35)",
        },
        ...sx,
      }}
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}

export default LogoutButton;
