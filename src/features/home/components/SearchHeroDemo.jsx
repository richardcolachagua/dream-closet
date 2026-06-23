import React, { useEffect, useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { colors } from "../../../shared/ui/theme/designTokens";
import { heroPanelSx } from "../../../shared/ui/theme/componentStyles";

const prompts = [
  "Looking for a structured black blazer under $250",
  "Need a yellow sundress for a summer wedding",
  "Searching for oversized leather boots in brown",
  "Find high-waisted black shorts for vacation",
];

function SearchHeroDemo() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % prompts.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Box sx={{ ...heroPanelSx, p: { xs: 2, md: 2.5 } }}>
      <Box
        sx={{
          minHeight: 62,
          borderRadius: 3,
          border: `1px solid ${colors.borderStrong}`,
          bgcolor: "#fff",
          color: "#111",
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <SearchIcon sx={{ color: "rgba(0,0,0,0.45)" }} />
        <Typography sx={{ fontWeight: 600, color: "rgba(0,0,0,0.78)" }}>
          {prompts[index]}
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ mt: 1.5 }}
      >
        <Chip
          icon={<TuneIcon />}
          label="Smart filters"
          sx={{
            bgcolor: colors.surface2,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
          }}
        />
        <Chip
          label="Multi-store results"
          sx={{
            bgcolor: colors.surface2,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
          }}
        />
        <Chip
          icon={<FavoriteBorderIcon />}
          label="Save favorites"
          sx={{
            bgcolor: colors.surface2,
            color: colors.textPrimary,
            border: `1px solid ${colors.border}`,
          }}
        />
      </Stack>
    </Box>
  );
}

export default SearchHeroDemo;
