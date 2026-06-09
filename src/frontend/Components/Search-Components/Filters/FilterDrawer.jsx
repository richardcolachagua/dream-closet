import { Drawer, Box, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchFiltersPanel from "./SearchFiltersPanel";
import { primaryButtonSx, ghostButtonSx } from "../../Buttons/buttonStyles";

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
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#111111",
          color: "white",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Filter results
        </Typography>

        <IconButton
          onClick={onClose}
          sx={{ color: "white" }}
          aria-label="Close filters"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          px: 2,
          pt: 1,
          pb: 0,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onClearAll} sx={ghostButtonSx}>
          Clear all
        </Button>
      </Box>

      <Box
        sx={{
          p: 2,
          overflowY: "auto",
          flex: 1,
        }}
      >
        <SearchFiltersPanel
          filters={filters}
          onToggleFilter={onToggleFilter}
          onPriceChange={onPriceChange}
          onClearGroup={onClearGroup}
          onClearAll={onClearAll}
          onApply={onApply}
          showActions
          applyButtonSx={primaryButtonSx}
        />
      </Box>
    </Drawer>
  );
}

export default FilterDrawer;
