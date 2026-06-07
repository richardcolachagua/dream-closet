import React from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const PasswordReset = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "black",
        minHeight: "100vh",
      }}
    >
      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          paddingTop: "40px",
          paddingBottom: "20px",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{
            color: "white",
            marginBottom: "30px",
            cursor: "pointer",
          }}
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(-1);
          }}
        />

        <Typography
          variant="h3"
          sx={{
            display: "flex",
            fontWeight: "bold",
            color: "white",
            marginBottom: "20px",
          }}
        >
          Password Reset
        </Typography>

        <Typography
          variant="h6"
          sx={{
            display: "flex",
            fontWeight: "bold",
            color: "white",
            paddingBottom: "15px",
            maxWidth: 680,
          }}
        >
          Your password reset request has been verified. Continue to set your
          new password.
        </Typography>
      </Stack>

      <Stack
        direction="column"
        sx={{
          paddingLeft: "40px",
          alignItems: "flex-start",
        }}
      >
        <Button
          variant="contained"
          sx={{
            borderRadius: "10px",
            width: "200px",
            minHeight: 48,
            textTransform: "none",
            fontWeight: 700,
          }}
          onClick={() => navigate("/setpassword", { replace: true })}
          aria-label="Confirm password reset and set a new password"
        >
          Confirm
        </Button>
      </Stack>
    </Box>
  );
};

export default PasswordReset;
