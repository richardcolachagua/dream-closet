import { Box, Tooltip, Typography } from "@mui/material";

function ColorFilterGroup({
  options = [],
  selectedColors = [],
  onToggleColor,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1.25,
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
              aria-label={`Filter by ${option.label}`}
              sx={{
                width: 36,
                height: 36,
                borderRadius: "999px",
                border: isSelected
                  ? "2px solid turquoise"
                  : isWhite
                    ? "1px solid rgba(255,255,255,0.35)"
                    : "1px solid transparent",
                outline: "none",
                cursor: "pointer",
                background: option.hex,
                boxShadow: isSelected
                  ? "0 0 0 3px rgba(64, 224, 208, 0.2)"
                  : "none",
                transition: "all 0.2s ease",
                position: "relative",
                "&:hover": {
                  transform: "scale(1.06)",
                },
                "&:focus-visible": {
                  boxShadow: "0 0 0 3px rgba(64, 224, 208, 0.35)",
                },
              }}
            >
              {isSelected && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color:
                      isWhite || option.value === "yellow" ? "black" : "white",
                    fontSize: "0.9rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Box>
              )}
            </Box>
          </Tooltip>
        );
      })}

      {selectedColors.length === 0 && (
        <Typography
          variant="body2"
          sx={{
            width: "100%",
            mt: 1,
            color: "rgba(255,255,255,0.65)",
          }}
        >
          No colors selected.
        </Typography>
      )}
    </Box>
  );
}

export default ColorFilterGroup;
