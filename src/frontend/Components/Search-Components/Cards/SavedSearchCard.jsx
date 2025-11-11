import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Checkbox,
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
  "&:hover": {
    boxShadow: "0 12px 36px #30e3ca44, 0 2px 18px #2626f533",
    border: "2px solid #30e3ca",
    color: "#30e3ca",
    transform: "scale(1.035) translateY(-6px)",
  },
  "&.Mui-selected": {
    border: "2.5px solid #ffd700",
    background: "#212125",
  },
};

const SavedSearchCard = ({
  query,
  date,
  onDelete,
  onClick,
  selected,
  onSelect,
}) => (
  <Card
    sx={{ ...cardHover, position: "relative" }}
    onClick={onClick}
    tabIndex={0}
    aria-label={`Saved search ${query}`}
    elevation={3}
  >
    <CardContent sx={{ pb: 1, pt: 2, px: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <SearchIcon sx={{ color: "#30e3ca", mr: 1, fontSize: 27 }} />
        <Typography
          variant="h6"
          sx={{ color: "#fff", fontWeight: 600, flex: 1 }}
        >
          {query}
        </Typography>
        {typeof onSelect === "function" && (
          <Checkbox
            checked={!!selected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            color="info"
            sx={{ ml: 2 }}
            inputProps={{ "aria-label": `Select search ${query}` }}
          />
        )}
      </Box>
      <Typography variant="body2" sx={{ color: "#bbb", mb: 1 }}>
        {date ? (
          `Saved: ${date}`
        ) : (
          <span style={{ color: "#888" }}>Not yet run</span>
        )}
      </Typography>
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
      <Box sx={{ flex: 1 }} />
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

export default SavedSearchCard;
