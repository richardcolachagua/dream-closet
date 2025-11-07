import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Button,
} from "@mui/material";
import SaveForLaterButton from "../Buttons/SaveForLaterButton";

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
    transform: "translateY(-8px) scale(1.02)",
    backgroundColor: "#232323",
    borderColor: "#30e3ca",
    color: "#30e3ca",
  },
};
const mediaStyles = {
  width: "100%",
  height: 400,
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
const SavedItemCard = ({
  imageUrl,
  title,
  subtitle,
  source,
  savedItem,
  userId,
  productUrl,
}) => (
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
    <CardContent
      sx={{
        minHeight: 120, // or the value determined by your typical content
        maxHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: "bold",
          overflow: "hidden",
          textOverflow: "ellipsis",
          // For multi-line clamp:
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          whiteSpace: "normal",
          minHeight: 120, // adjust this for one/two line variant height
        }}
      >
        {title || "—"}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: "#bbb",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            whiteSpace: "normal",
            minHeight: 20, // adjust for body2 height
          }}
        >
          {subtitle || "—"}
        </Typography>
      )}
      {source && (
        <Typography
          variant="body2"
          sx={{
            color: "#aaa",
            fontSize: 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            whiteSpace: "normal",
            minHeight: 20,
          }}
        >
          Source: {source || "—"}
        </Typography>
      )}
    </CardContent>
    <CardActions
      sx={{
        px: 6,
        py: 12,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
        }}
      >
        <SaveForLaterButton
          item={savedItem}
          userId={userId}
          sx={{ color: "#30e3ca", minWidth: 40, minHeight: 40 }}
        />
        <Button
          size="small"
          variant="contained"
          sx={{
            fontWeight: "bold",
            backgroundColor: "turquoise",
            color: "black",
            borderRadius: 3,
            minWidth: 110,
            minHeight: 40,
            textTransform: "none",
          }}
          href={productUrl}
          target="_blank"
        >
          View Product
        </Button>
      </Box>
    </CardActions>
  </Card>
);

export default SavedItemCard;
