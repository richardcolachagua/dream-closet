import { Drawer, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchFiltersPanel from "./SearchFiltersPanel";

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
          bgcolor: "black",
          color: "white",
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
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Filter results
        </Typography>

        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
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
        />
      </Box>
    </Drawer>
  );
}

export default FilterDrawer;
