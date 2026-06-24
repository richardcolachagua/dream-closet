import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DoneIcon from "@mui/icons-material/Done";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";
import { FILTER_OPTIONS } from "../utils/filterOptions";
import FilterSection from "./FilterSection";
import ColorFilterGroup from "./ColorFilterGroup";

const sectionTitleSx = {
  color: colors.textPrimary,
  fontWeight: 800,
  fontSize: "1rem",
};

const helperTextSx = {
  color: colors.textMuted,
  fontSize: "0.9rem",
};

function FilterDrawer({
  open,
  onClose,
  filters,
  onToggleFilter,
  onPriceChange,
  onClearGroup,
  onClearAll,
  onApply,
}) {
  const safeFilters = filters || {};

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 440 },
          bgcolor: colors.background,
          color: colors.textPrimary,
          backgroundImage:
            "radial-gradient(circle at top, rgba(89,230,219,0.05), transparent 25%)",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            px: 2.25,
            py: 2,
            borderBottom: `1px solid ${colors.border}`,
            bgcolor: colors.background,
          }}
        >
          <Box>
            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 850,
                fontSize: "1.2rem",
              }}
            >
              Filters
            </Typography>
            <Typography sx={{ color: colors.textMuted, fontSize: "0.92rem" }}>
              Narrow results by category, size, color, availability, and price.
            </Typography>
          </Box>

          <Button
            onClick={onClose}
            sx={{
              color: colors.textSecondary,
              minWidth: "auto",
              p: 0.75,
            }}
            aria-label="Close filters"
          >
            <CloseIcon />
          </Button>
        </Stack>

        {/* Body */}
        <Stack
          spacing={3}
          sx={{
            overflowY: "auto",
            px: 2.25,
            py: 2.25,
          }}
        >
          <FilterSection
            title="Gender"
            options={FILTER_OPTIONS.gender || []}
            selectedValues={safeFilters.gender || []}
            onToggle={(value) => onToggleFilter("gender", value)}
            onClear={() => onClearGroup("gender")}
          />

          <Divider sx={{ borderColor: colors.border }} />

          <FilterSection
            title="Category"
            options={FILTER_OPTIONS.category || []}
            selectedValues={safeFilters.category || []}
            onToggle={(value) => onToggleFilter("category", value)}
            onClear={() => onClearGroup("category")}
          />

          <Divider sx={{ borderColor: colors.border }} />

          <FilterSection
            title="Size"
            options={FILTER_OPTIONS.size || []}
            selectedValues={safeFilters.size || []}
            onToggle={(value) => onToggleFilter("size", value)}
            onClear={() => onClearGroup("size")}
          />

          <Divider sx={{ borderColor: colors.border }} />

          {/* Color using ColorFilterGroup */}
          <Stack spacing={1.25}>
            <Box>
              <Typography sx={sectionTitleSx}>Color</Typography>
              <Typography sx={helperTextSx}>
                Choose one or more tones.
              </Typography>
            </Box>

            <ColorFilterGroup
              options={FILTER_OPTIONS.color || []}
              selectedColors={safeFilters.color || []}
              onToggleColor={(value) => onToggleFilter("color", value)}
            />

            {safeFilters.color?.length > 0 && (
              <Button
                onClick={() => onClearGroup("color")}
                sx={{
                  alignSelf: "flex-start",
                  color: colors.accent,
                  fontWeight: 700,
                  textTransform: "none",
                  minWidth: "auto",
                  px: 0,
                }}
              >
                Clear colors
              </Button>
            )}
          </Stack>

          <Divider sx={{ borderColor: colors.border }} />

          <FilterSection
            title="Store"
            options={FILTER_OPTIONS.store || []}
            selectedValues={safeFilters.store || []}
            onToggle={(value) => onToggleFilter("store", value)}
            onClear={() => onClearGroup("store")}
          />

          <Divider sx={{ borderColor: colors.border }} />

          <FilterSection
            title="Availability"
            options={FILTER_OPTIONS.availability || []}
            selectedValues={safeFilters.availability || []}
            onToggle={(value) => onToggleFilter("availability", value)}
            onClear={() => onClearGroup("availability")}
          />

          <Divider sx={{ borderColor: colors.border }} />

          {/* Price range */}
          <Stack spacing={1.5}>
            <Box>
              <Typography sx={sectionTitleSx}>Price range</Typography>
              <Typography sx={helperTextSx}>
                Set a minimum and maximum price.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <TextField
                label="Min price"
                type="number"
                value={safeFilters.priceMin || ""}
                onChange={(event) =>
                  onPriceChange("priceMin", event.target.value)
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.surface2,
                    color: colors.textPrimary,
                    "& fieldset": {
                      borderColor: colors.border,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.accent,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.accent,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.textPrimary,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textMuted,
                  },
                }}
              />

              <TextField
                label="Max price"
                type="number"
                value={safeFilters.priceMax || ""}
                onChange={(event) =>
                  onPriceChange("priceMax", event.target.value)
                }
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.surface2,
                    color: colors.textPrimary,
                    "& fieldset": {
                      borderColor: colors.border,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.accent,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.accent,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.textPrimary,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.textMuted,
                  },
                }}
              />
            </Stack>
          </Stack>
        </Stack>

        {/* Footer actions */}
        <Box
          sx={{
            p: 2.25,
            borderTop: `1px solid ${colors.border}`,
            bgcolor: colors.background,
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={onClearAll}
              sx={{
                ...secondaryButtonSx,
                flex: 1,
                minHeight: 46,
              }}
            >
              Clear all
            </Button>

            <Button
              variant="contained"
              endIcon={<DoneIcon />}
              onClick={onApply}
              sx={{
                ...primaryButtonSx,
                flex: 1,
                minHeight: 46,
              }}
            >
              Apply filters
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}

export default FilterDrawer;
