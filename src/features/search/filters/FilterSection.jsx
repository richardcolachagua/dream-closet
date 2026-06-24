import { Box, Button, Stack, Typography } from "@mui/material";
import { colors } from "../../../shared/ui/theme/designTokens";

const sectionTitleSx = {
  color: colors.textPrimary,
  fontWeight: 800,
  fontSize: "1rem",
};

const helperTextSx = {
  color: colors.textMuted,
  fontSize: "0.9rem",
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
    <Stack spacing={1.25}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
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
            sx={{
              color: colors.accent,
              fontWeight: 700,
              textTransform: "none",
              minWidth: "auto",
              px: 0,
            }}
          >
            Clear
          </Button>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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
                height: 36,
                borderRadius: 999,
                px: 1.5,
                border: `1px solid ${
                  isSelected ? colors.accentBorder : colors.border
                }`,
                bgcolor: isSelected ? colors.accentSoft : colors.surface2,
                color: isSelected ? colors.accent : colors.textPrimary,
                fontWeight: isSelected ? 700 : 500,
                textTransform: "none",
                fontSize: "0.9rem",
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
