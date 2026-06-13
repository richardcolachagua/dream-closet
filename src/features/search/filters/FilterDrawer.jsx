import { Drawer, Box, IconButton, Typography, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchFiltersPanel from "../../search/filters/FiltersPanel";

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
          bgcolor: "#0c0c0c",
          color: "white",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0))",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.75,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Filter results
        </Typography>

        <IconButton onClick={onClose} sx={{ color: "white" }}>
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
        <Button
          onClick={onClearAll}
          sx={{
            color: "turquoise",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
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
        />
      </Box>
    </Drawer>
  );
}

export default FilterDrawer;
