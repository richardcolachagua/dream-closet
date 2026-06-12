import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedPageShell from "../../Components/AnimatedPageShell";

const MotionBox = motion(Box);

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AnimatedPageShell maxWidth="sm">
      <MotionBox
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        sx={{
          textAlign: "center",
          borderRadius: 4,
          p: { xs: 4, md: 5 },
          border: "1px solid rgba(64,224,208,0.16)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <Chip
          label="404"
          sx={{
            mb: 2,
            bgcolor: "turquoise",
            color: "black",
            fontWeight: 800,
          }}
        />

        <Typography
          variant="h3"
          sx={{ color: "white", fontWeight: 800, mb: 2 }}
        >
          This page slipped out of the closet
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.72)",
            maxWidth: 520,
            mx: "auto",
            mb: 4,
          }}
        >
          The page you were looking for doesn’t exist, may have moved, or is no
          longer available.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Button
            variant="contained"
            onClick={() => navigate("/search")}
            sx={{
              px: 3.5,
              py: 1.25,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "turquoise",
              color: "black",
              "&:hover": { bgcolor: "#00b4aa" },
            }}
          >
            Go to Search
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/")}
            sx={{
              px: 3.5,
              py: 1.25,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
              color: "white",
              borderColor: "rgba(64,224,208,0.5)",
              "&:hover": {
                borderColor: "turquoise",
                backgroundColor: "rgba(64,224,208,0.08)",
              },
            }}
          >
            Back Home
          </Button>

          <Button
            variant="text"
            onClick={() => navigate(-1)}
            sx={{
              textTransform: "none",
              color: "rgba(255,255,255,0.72)",
            }}
          >
            Go Back
          </Button>
        </Stack>
      </MotionBox>
    </AnimatedPageShell>
  );
};

export default NotFoundPage;
