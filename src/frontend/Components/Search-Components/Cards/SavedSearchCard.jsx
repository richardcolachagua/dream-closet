import { Card, CardContent, Typography, Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const cardHover = {
  transition: "transform 0.2s, box-shadow 0.2s",
  boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "14px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  "&:hover": {
    boxShadow: "0 8px 28px rgba(36,175,255,0.18)",
    transform: "translateY(-8px) scale(1.05)",
    backgroundColor: "#232323",
    borderColor: "#30e3ca",
    color: "#30e3ca",
  },
};

const SavedSearchCard = ({ query, date, onDelete }) => (
  <Card sx={cardHover}>
    <CardContent>
      <Typography variant="h6" sx={{ color: "#fff", mb: 1 }}>
        {query}
      </Typography>
      <Typography variant="body2" sx={{ color: "#bbb", mb: 2 }}>
        Date: {date}
      </Typography>
    </CardContent>
    <Box sx={{ px: 2, pb: 2 }}>
      <IconButton onClick={onDelete}>
        <DeleteIcon sx={{ color: "#30e3ca" }} />
      </IconButton>
    </Box>
  </Card>
);

export default SavedSearchCard;
