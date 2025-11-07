import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
} from "@mui/material";

// Styles
const cardHover = {
  transition: "transform 0.2s, box-shadow 0.2s",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "14px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  boxShadow: "0 2px 12px rgba(0,0,0,0.8)",
  "&:hover": {
    boxShadow: "0 8px 28px rgba(36,175,255,0.18)",
    transform: "translateY(-8px) scale(1.05)",
    backgroundColor: "#232323",
    borderColor: "#30e3ca",
    color: "#30e3ca",
  },
};
const mediaStyles = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: "12px 12px 0 0",
};
const placeholderStyles = {
  width: "100%",
  height: 180,
  background: "#333",
  borderRadius: "12px 12px 0 0",
};

// The presentational card
const SavedItemCard = ({ imageUrl, title, subtitle, source, actions }) => (
  <Card sx={cardHover}>
    {imageUrl ? (
      <CardMedia
        component="img"
        image={imageUrl}
        alt={title}
        sx={mediaStyles}
      />
    ) : (
      <Box sx={placeholderStyles} />
    )}
    <CardContent>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: "#bbb", mb: 1 }}>
          {subtitle}
        </Typography>
      )}
      {source && (
        <Typography
          variant="body2"
          sx={{ color: "#aaa", fontSize: 14 }}
        >{`Source: ${source}`}</Typography>
      )}
    </CardContent>
    <CardActions sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
      {actions}
    </CardActions>
  </Card>
);

export default SavedItemCard;
