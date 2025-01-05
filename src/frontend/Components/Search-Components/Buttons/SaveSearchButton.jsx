import React from "react";
import { Button } from "@mui/material";

function SaveSearchButton({ onSave }) {
  const handleSaveSearch = () => {
    onSave();
  };
  return (
       <Button variant="contained"  sx={{
        bgcolor: "primary.main",
        "&:hover": { bgcolor: "primary.dark" },
        mr: 2,
        width: "100px",
        backgroundColor: "turquoise",
        color: "black",
        fontWeight: "bold",
        fontSize: "15px",
          
          }} onClick={handleSaveSearch}>
          Save Search
        </Button>
  );
}

export default SaveSearchButton;
