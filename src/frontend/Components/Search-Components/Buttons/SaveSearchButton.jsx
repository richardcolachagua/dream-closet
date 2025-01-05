import React from "react";
import { Button } from "@mui/material";

function SaveSearchButton({ onSave }) {
  const handleSaveSearch = () => {
    onSave();
  };
  return (
  
       <Button variant="contained"  sx={{
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            
            },
          }} onClick={handleSaveSearch}>
          Save Search
        </Button>
  );
}

export default SaveSearchButton;
