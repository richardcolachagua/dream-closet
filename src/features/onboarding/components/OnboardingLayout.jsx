import React from "react";
import { Box, Container, CssBaseline, Typography } from "@mui/material";

const OnboardingLayout = ({ children, title, subtitle, stepLabel }) => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          bgcolor: "black",
          color: "white",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 6,
          }}
        >
          {stepLabel && (
            <Typography
              variant="subtitle2"
              sx={{
                textAlign: "center",
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: 1,
                color: "grey.400",
              }}
            >
              {stepLabel}
            </Typography>
          )}

          {title && (
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                mb: subtitle ? 1 : 3,
              }}
            >
              {title}
            </Typography>
          )}

          {subtitle && (
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: "center",
                mb: 4,
                color: "gray.300",
              }}
            >
              {subtitle}
            </Typography>
          )}

          {children}
        </Container>
      </Box>
    </>
  );
};

export default OnboardingLayout;
