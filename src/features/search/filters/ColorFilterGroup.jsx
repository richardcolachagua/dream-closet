import React from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { colors } from "../../../shared/ui/theme/designTokens";

function ColorFilterGroup({
  options = [],
  selectedColors = [],
  onToggleColor,
}) {
  return (
    <Stack spacing={1.2}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))",
          gap: 1,
          maxWidth: 320,
        }}
      >
        {options.map((option) => {
          const isSelected = selectedColors.includes(option.value);
          const isWhite = option.value === "white";

          return (
            <Tooltip key={option.value} title={option.label} arrow>
              <Box
                component="button"
                type="button"
                onClick={() => onToggleColor(option.value)}
                aria-pressed={isSelected}
                aria-label={`Filter by ${option.label}`}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "999px",
                  border: isSelected
                    ? `2px solid ${colors.accent}`
                    : isWhite
                      ? `1px solid ${colors.border}`
                      : "1px solid transparent",
                  outline: "none",
                  cursor: "pointer",
                  background: option.hex,
                  boxShadow: isSelected
                    ? `0 0 0 4px ${colors.accentSoft}`
                    : "none",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                  position: "relative",
                  "&:hover": {
                    transform: "scale(1.06)",
                  },
                  "&:focus-visible": {
                    boxShadow: `0 0 0 4px ${colors.accentSoft}`,
                    borderColor: colors.accent,
                  },
                }}
              >
                {isSelected ? (
                  <CheckRoundedIcon
                    sx={{
                      fontSize: 18,
                      color: isWhite ? colors.textPrimary : "#ffffff",
                      position: "absolute",
                      inset: 0,
                      m: "auto",
                    }}
                  />
                ) : null}
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {selectedColors.length === 0 ? (
        <Typography
          sx={{
            color: colors.textMuted,
            fontSize: "0.88rem",
          }}
        >
          No colors selected yet.
        </Typography>
      ) : (
        <Typography
          sx={{
            color: colors.textSecondary,
            fontSize: "0.88rem",
          }}
        >
          {selectedColors.length} color
          {selectedColors.length === 1 ? "" : "s"} selected.
        </Typography>
      )}
    </Stack>
  );
}

export default ColorFilterGroup;
