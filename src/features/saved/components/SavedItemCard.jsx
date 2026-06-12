import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Modal,
} from "@mui/material";
import SaveForLaterButton from "../Buttons/SaveForLaterButton";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useState } from "react";

const cardHover = {
  boxShadow: "0 2px 14px rgba(0,0,0,0.72)",
  backgroundColor: "#181818",
  color: "white",
  borderRadius: "22px",
  minWidth: 270,
  maxWidth: 340,
  mx: "auto",
  overflow: "hidden",
  cursor: "pointer",
  border: "2px solid transparent", // Always present
  transition: "box-shadow 0.22s, transform 0.18s, border 0.22s, color 0.22s",
  "&:hover": {
    boxShadow: "0 12px 36px #30e3ca44, 0 2px 18px #2626f533",
    border: "2px solid #30e3ca", // SOLID color border for reliable rounding
    color: "#30e3ca",
    transform: "scale(1.035) translateY(-6px)",
  },
  "&.Mui-selected": {
    border: "2.5px solid #ffd700",
    background: "#212125",
  },
};

const mediaStyles = {
  width: "100%",
  height: 260,
  objectFit: "cover",
  borderRadius: "16px 16px 0 0",
  cursor: "pointer",
};

const placeholderStyles = {
  width: "100%",
  height: 260,
  background: "#333",
  borderRadius: "16px 16px 0 0",
};

const SavedItemCard = ({
  imageUrl,
  title,
  subtitle,
  source,
  savedItem,
  userId,
  productUrl,
  badge,
  onRemove,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const renderBadge = () =>
    badge ? (
      <Chip
        label={badge}
        color="primary"
        size="small"
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          background: "linear-gradient(90deg, #30e3ca, #1198fb 90%)",
          color: "#181818",
          fontWeight: "bold",
        }}
      />
    ) : null;

  return (
    <Card sx={cardHover} elevation={3} tabIndex={0}>
      <Box sx={{ position: "relative" }}>
        {renderBadge()}
        {imageUrl ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={title}
            sx={mediaStyles}
            onClick={() => setModalOpen(true)}
            aria-label="View Details"
          />
        ) : (
          <Box sx={placeholderStyles} />
        )}
      </Box>
      <CardContent sx={{ minHeight: 120, maxHeight: 140, px: 1 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            fontWeight: "bold",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            whiteSpace: "normal",
            minHeight: 52,
          }}
        >
          {title || "—"}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: "#30e3ca",
              fontWeight: 600,
              mb: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              whiteSpace: "normal",
              fontSize: 18,
              minHeight: 18,
            }}
          >
            {subtitle}
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
              minHeight: 18,
            }}
          >
            Source: {source || "—"}
          </Typography>
        )}
      </CardContent>
      <CardActions
        sx={{
          px: 2,
          pb: 1,
          pt: 0.5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <SaveForLaterButton
            item={savedItem}
            userId={userId}
            sx={{ color: "#30e3ca", minWidth: 38, minHeight: 38 }}
            aria-label="Bookmark"
          />
          <IconButton
            size="small"
            sx={{ color: "#fff", background: "#30e3ca", borderRadius: 2 }}
            component="a"
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Product"
          >
            <OpenInNewIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: "#fff", background: "#ff4181", borderRadius: 2 }}
            onClick={onRemove}
            aria-label="Remove Item"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
        <Button
          size="small"
          variant="contained"
          sx={{
            fontWeight: "bold",
            backgroundColor: "turquoise",
            color: "black",
            borderRadius: 4,
            minWidth: 90,
            minHeight: 40,
            textTransform: "none",
            ml: 1,
          }}
          onClick={() => navigator.clipboard.writeText(productUrl)}
          aria-label="Copy Link"
        >
          Copy Link
        </Button>
      </CardActions>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#222",
            color: "#fff",
            borderRadius: "18px",
            boxShadow: 24,
            p: 4,
            outline: "none",
            maxWidth: 400,
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl}
            alt={title}
            sx={{
              width: "100%",
              maxHeight: 250,
              borderRadius: 4,
              mb: 2,
              objectFit: "cover",
            }}
          />
          <Typography
            id="modal-title"
            variant="h6"
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            {title}
          </Typography>
          <Typography id="modal-desc" variant="body2" sx={{ mb: 2 }}>
            {savedItem?.description || "No description available."}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            href={productUrl}
            target="_blank"
            sx={{ mt: 2 }}
          >
            View Product
          </Button>
        </Box>
      </Modal>
    </Card>
  );
};

export default SavedItemCard;
