import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

const sectionTitleSx = {
  color: colors.textPrimary,
  fontWeight: 800,
  fontSize: "1rem",
};

const helperTextSx = {
  color: colors.textMuted,
  fontSize: "0.9rem",
  lineHeight: 1.6,
};

function FilterSection({
  title,
  subtitle,
  options = [],
  selectedValues = [],
  onToggle,
  onClear,
  renderOption,
}) {
  const hasSelections = selectedValues.length > 0;

  return (
    <Stack spacing={1.4}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
      >
        <Box>
          <Typography sx={sectionTitleSx}>{title}</Typography>
          {subtitle ? (
            <Typography sx={helperTextSx}>{subtitle}</Typography>
          ) : null}
        </Box>

        {hasSelections ? (
          <Button
            onClick={onClear}
            startIcon={<RestartAltRoundedIcon fontSize="small" />}
            sx={{
              color: colors.accent,
              fontWeight: 700,
              textTransform: "none",
              minWidth: "auto",
              px: 0,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "transparent",
                opacity: 0.9,
              },
            }}
          >
            Clear
          </Button>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          const isSelected = selectedValues.includes(value);

          if (renderOption) {
            return renderOption({ option, value, label, isSelected, onToggle });
          }

          return (
            <Button
              key={value}
              onClick={() => onToggle?.(value)}
              sx={{
                minHeight: 38,
                borderRadius: radius.full || 999,
                px: 1.6,
                border: `1px solid ${
                  isSelected ? colors.accentBorder : colors.border
                }`,
                bgcolor: isSelected ? colors.accentSoft : colors.surface2,
                color: isSelected ? colors.accent : colors.textPrimary,
                fontWeight: isSelected ? 700 : 600,
                textTransform: "none",
                fontSize: "0.9rem",
                "&:hover": {
                  bgcolor: isSelected ? colors.accentSoft : colors.surface,
                  borderColor: isSelected ? colors.accentBorder : colors.accent,
                },
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>
    </Stack>
  );
}

export default FilterSection;
