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
          alignContent: "center",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <ArrowBackIcon
          fontSize="large"
          sx={{ color: "white", mb: 3, cursor: "pointer" }}
          onClick={() => navigate(-1)}
          aria-label="Go back to previous page"
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate(-1);
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "white",
            display: "flex",
            alignContent: "center",
          }}
        >
          Successful
        </Typography>
        <Typography
          variant="h5"
          sx={{
            color: "white",
            pt: 1,
            mb: 3,
            display: "flex",
            alignContent: "center",
          }}
        >
          Congratulations! Your password has been changed. Click below to login.
        </Typography>
        <Stack direction="column" alignItems="center">
          <Button
            variant="contained"
            sx={{ borderRadius: "10px", width: "200px" }}
            onClick={() => navigate("/login")}
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
