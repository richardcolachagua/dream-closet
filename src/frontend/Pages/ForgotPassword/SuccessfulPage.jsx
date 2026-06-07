import React from "react";
import { Typography, Box, Button, Stack } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const SuccessfulPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        paddingLeft: "40px",
        paddingTop: "40px",
        paddingBottom: "30px",
      }}
    >
      <Stack
        direction="column"
        sx={{
          justifyContent: "center",
          display: "flex",
          maxWidth: 640,
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{ color: "white", mb: 3, cursor: "pointer" }}
          onClick={() => navigate("/loginpage", { replace: true })}
          aria-label="Go back to login page"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/loginpage", { replace: true });
            }
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "white",
            display: "flex",
          }}
        >
          Password updated
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: "white",
            pt: 1,
            mb: 3,
            display: "flex",
          }}
        >
          Your password has been changed successfully. Sign in with your new
          password.
        </Typography>

        <Stack direction="column" alignItems="flex-start">
          <Button
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: "220px",
              minHeight: 48,
              textTransform: "none",
              fontWeight: 700,
            }}
            onClick={() => navigate("/loginpage", { replace: true })}
            aria-label="Return to Login page"
          >
            Return to Login
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default SuccessfulPage;
