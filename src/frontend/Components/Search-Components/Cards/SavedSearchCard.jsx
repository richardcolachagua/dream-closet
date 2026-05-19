import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Checkbox,
  Chip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const cardHover = {
  boxShadow: "0 2px 12px rgba(0,0,0,0.15), 0 8px 30px rgba(30,180,220,0.10)",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "18px",
  minWidth: 270,
  mx: "auto",
  overflow: "hidden",
  cursor: "pointer",
  transition: "box-shadow 0.22s, transform 0.18s, border 0.22s, color 0.22s",
  border: "2px solid transparent",
  "&:hover": {
    boxShadow: "0 12px 36px #30e3ca44, 0 2px 18px #2626f533",
    border: "2px solid #30e3ca",
    color: "#30e3ca",
    transform: "scale(1.035) translateY(-6px)",
  },
};

const SORT_LABELS = {
  relevance: "Relevance",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  newest: "Newest",
};

const FILTER_LABELS = {
  gender: "Gender",
  category: "Category",
  size: "Size",
  color: "Color",
  brand: "Brand",
  store: "Store",
  availability: "Availability",
  priceMin: "Min",
  priceMax: "Max",
};

const formatFilterLabel = (key, value) => {
  if (key === "priceMin") return `Min $${value}`;
  if (key === "priceMax") return `Max $${value}`;
  return `${FILTER_LABELS[key] || key}: ${value}`;
};

const getFilterChips = (filters = {}) => {
  const chips = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((item) => {
        chips.push({
          key: `${key}-${item}`,
          label: formatFilterLabel(key, item),
        });
      });
    } else if (value !== "" && value !== null && value !== undefined) {
      chips.push({
        key,
        label: formatFilterLabel(key, value),
      });
    }
  });

  return chips;
};

const SavedSearchCard = ({
  query,
  date,
  filters = {},
  sort = "relevance",
  page = 1,
  onDelete,
  onClick,
  selected,
  onSelect,
}) => {
  const filterChips = getFilterChips(filters);
  const visibleChips = filterChips.slice(0, 3);
  const remainingChipCount = filterChips.length - visibleChips.length;

  return (
    <Card
      sx={{
        ...cardHover,
        position: "relative",
        border: selected ? "2.5px solid #ffd700" : cardHover.border,
        background: selected ? "#212125" : cardHover.backgroundColor,
      }}
      onClick={onClick}
      tabIndex={0}
      aria-label={`Saved search ${query}`}
      elevation={3}
    >
      <CardContent sx={{ pb: 1, pt: 2, px: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}>
          <SearchIcon
            sx={{ color: "#30e3ca", mr: 1, fontSize: 27, mt: 0.25 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                fontWeight: 600,
                lineHeight: 1.25,
                wordBreak: "break-word",
              }}
            >
              {query}
            </Typography>

            <Typography variant="body2" sx={{ color: "#bbb", mt: 0.75 }}>
              {date ? `Saved: ${date}` : "Not yet run"}
            </Typography>
          </Box>

          {typeof onSelect === "function" && (
            <Checkbox
              checked={!!selected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              color="info"
              sx={{ ml: 1 }}
              inputProps={{ "aria-label": `Select search ${query}` }}
            />
          )}
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: 1.5 }}
        >
          <Chip
            size="small"
            label={`Sort: ${SORT_LABELS[sort] || sort}`}
            sx={{
              bgcolor: "rgba(48,227,202,0.12)",
              color: "#30e3ca",
              border: "1px solid rgba(48,227,202,0.35)",
            }}
          />
          {page > 1 && (
            <Chip
              size="small"
              label={`Page ${page}`}
              sx={{
                bgcolor: "rgba(255,255,255,0.08)",
                color: "#ddd",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            />
          )}
          {filterChips.length > 0 && (
            <Chip
              size="small"
              label={`${filterChips.length} filter${filterChips.length === 1 ? "" : "s"}`}
              sx={{
                bgcolor: "rgba(255,215,0,0.12)",
                color: "#ffd700",
                border: "1px solid rgba(255,215,0,0.28)",
              }}
            />
          )}
        </Stack>

        {filterChips.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 1.5 }}
          >
            {visibleChips.map((chip) => (
              <Chip
                key={chip.key}
                size="small"
                label={chip.label}
                sx={{
                  maxWidth: "100%",
                  bgcolor: "rgba(255,255,255,0.05)",
                  color: "#f4f4f4",
                  border: "1px solid rgba(255,255,255,0.12)",
                  ".MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            ))}

            {remainingChipCount > 0 && (
              <Chip
                size="small"
                label={`+${remainingChipCount} more`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#bbb",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            )}
          </Stack>
        )}
      </CardContent>

      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          borderTop: "1px solid #232232",
          mt: 2,
          bgcolor: "rgba(30,180,220,0.06)",
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="caption" sx={{ color: "#8fded6" }}>
            Tap to rerun search
          </Typography>
        </Box>

        <Tooltip title="Delete saved search" arrow>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            size="large"
            edge="end"
            aria-label="delete search"
          >
            <DeleteIcon sx={{ color: "#30e3ca", fontSize: 27 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  );
};

export default SavedSearchCard;
