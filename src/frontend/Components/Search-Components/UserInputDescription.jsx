import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

function UserDescriptionInput() {
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = async () => {
    if (description.trim() === "") {
      alert("Please enter a description.");
      return;
    }
    try {
      // Replace '/api/submit-description' with your actual API endpoint
      const response = await fetch("/api/submit-description", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      setSubmitted(true);
      console.log(data);
    } catch (error) {
      console.error("Error submitting description:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > :not(style)": { m: 1 },
      }}
    >
      {submitted ? (
        <p>Thank you for your submission!</p>
      ) : (
        <>
          <TextField
            label="I am looking for a..."
            variant="filled"
            value={description}
            onChange={handleInputChange}
            sx={{
              width: "90%",
              maxWidth: "500px",
              backgroundColor: "white",
              border: "10px",
              borderBottom: "2px solid #ccc",
              borderRadius: "10px",
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              bgcolor: "primary.main",
              "&:hover": {
                bgcolor: "primary.dark",
              },
            }}
          >
            Search
          </Button>
        </>
      )}
    </Box>
  );
}

export default UserDescriptionInput;
