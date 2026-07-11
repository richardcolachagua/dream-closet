import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { colors } from "../theme/designTokens";
import { sectionEyebrowSx } from "../theme/componentStyles";

function PageSection({
  eyebrow,
  title,
  description,
  children,
  actions = null,
  sx = {},
  contentSx = {},
}) {
  return (
    <Box
      sx={{
        width: "100%",
        py: { xs: 4, md: 5 },
        ...sx,
      }}
    >
      <Stack spacing={2.25} sx={{ mb: 3.5 }}>
        {eyebrow ? <Box sx={sectionEyebrowSx}>{eyebrow}</Box> : null}

        {title ? (
          <Typography
            sx={{
              color: colors.textPrimary,
              fontWeight: 850,
              fontSize: { xs: "1.8rem", md: "2.35rem" },
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              maxWidth: 820,
            }}
          >
            {title}
          </Typography>
        ) : null}

        {description ? (
          <Typography
            sx={{
              color: colors.textSecondary,
              maxWidth: 760,
              lineHeight: 1.75,
              fontSize: { xs: "1rem", md: "1.05rem" },
            }}
          >
            {description}
          </Typography>
        ) : null}

        {actions}
      </Stack>

      <Box
        sx={{
          width: "100%",
          ...contentSx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default PageSection;
