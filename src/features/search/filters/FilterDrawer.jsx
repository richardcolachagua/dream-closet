import React from "react";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DoneIcon from "@mui/icons-material/Done";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";
import { FILTER_OPTIONS } from "../utils/filterOptions";
import { getActiveFilterCount } from "../utils/filterHelpers";
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
  lineHeight: 1.6,
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: colors.surface2,
    color: colors.textPrimary,
    borderRadius: radius.md,
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
  const activeFilterCount = getActiveFilterCount(safeFilters);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 440 },
          bgcolor: colors.surface,
          color: colors.textPrimary,
          backgroundImage: "none",
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${colors.border}`,
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: colors.surface,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: colors.accentSoft,
                  color: colors.accent,
                  border: `1px solid ${colors.accentBorder}`,
                }}
              >
                <TuneRoundedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: colors.textPrimary,
                    fontWeight: 800,
                    fontSize: "1.1rem",
                  }}
                >
                  Filters
                </Typography>
                <Typography
                  sx={{
                    color: colors.textMuted,
                    fontSize: "0.9rem",
                  }}
                >
                  {activeFilterCount > 0
                    ? `${activeFilterCount} active filter${
                        activeFilterCount === 1 ? "" : "s"
                      }`
                    : "Narrow by category, size, color, store, and price."}
                </Typography>
              </Box>
            </Stack>

            <IconButton
              onClick={onClose}
              aria-label="Close filters"
              sx={{
                color: colors.textPrimary,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.surface2,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        <Stack
          spacing={3}
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 2.5,
            py: 2.5,
          }}
        >
          <FilterSection
            title="Gender"
            subtitle="Choose the shopper or fit focus."
            options={FILTER_OPTIONS.gender}
            selectedValues={safeFilters.gender || []}
            onToggle={(value) => onToggleFilter("gender", value)}
            onClear={() => onClearGroup("gender")}
          />

          <Divider sx={{ borderColor: colors.divider }} />

          <FilterSection
            title="Category"
            subtitle="Pick one or more clothing categories."
            options={FILTER_OPTIONS.category}
            selectedValues={safeFilters.category || []}
            onToggle={(value) => onToggleFilter("category", value)}
            onClear={() => onClearGroup("category")}
          />

          <Divider sx={{ borderColor: colors.divider }} />

          <FilterSection
            title="Size"
            subtitle="Refine by size availability."
            options={FILTER_OPTIONS.size}
            selectedValues={safeFilters.size || []}
            onToggle={(value) => onToggleFilter("size", value)}
            onClear={() => onClearGroup("size")}
          />

          <Divider sx={{ borderColor: colors.divider }} />

          <Stack spacing={1.4}>
            <Box>
              <Typography sx={sectionTitleSx}>Color</Typography>
              <Typography sx={helperTextSx}>
                Choose one or more tones.
              </Typography>
            </Box>

            <ColorFilterGroup
              options={FILTER_OPTIONS.color}
              selectedColors={safeFilters.color || []}
              onToggleColor={(value) => onToggleFilter("color", value)}
            />

            {(safeFilters.color || []).length > 0 ? (
              <Button
                onClick={() => onClearGroup("color")}
                sx={{
                  alignSelf: "flex-start",
                  color: colors.accent,
                  fontWeight: 700,
                  textTransform: "none",
                  minWidth: "auto",
                  px: 0,
                  "&:hover": {
                    bgcolor: "transparent",
                    opacity: 0.9,
                  },
                }}
              >
                Clear colors
              </Button>
            ) : null}
          </Stack>

          <Divider sx={{ borderColor: colors.divider }} />

          <FilterSection
            title="Store"
            subtitle="Limit results to selected retailers."
            options={FILTER_OPTIONS.store}
            selectedValues={safeFilters.store || []}
            onToggle={(value) => onToggleFilter("store", value)}
            onClear={() => onClearGroup("store")}
          />

          <Divider sx={{ borderColor: colors.divider }} />

          <FilterSection
            title="Availability"
            subtitle="See what is currently in stock or available."
            options={FILTER_OPTIONS.availability}
            selectedValues={safeFilters.availability || []}
            onToggle={(value) => onToggleFilter("availability", value)}
            onClear={() => onClearGroup("availability")}
          />

          <Divider sx={{ borderColor: colors.divider }} />

          <Stack spacing={1.4}>
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
                sx={fieldSx}
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
                sx={fieldSx}
              />
            </Stack>
          </Stack>
        </Stack>

        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderTop: `1px solid ${colors.border}`,
            position: "sticky",
            bottom: 0,
            bgcolor: colors.surface,
          }}
        >
          <Stack direction="row" spacing={1.25}>
            <Button
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
      </Stack>
    </Drawer>
  );
}

export default FilterDrawer;
