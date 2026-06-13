import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LaunchIcon from "@mui/icons-material/Launch";

const formatPrice = (result) => {
  if (result?.price && String(result.price).trim()) return result.price;
  if (typeof result?.numericPrice === "number") {
    return `$${result.numericPrice.toFixed(2)}`;
  }
  return "Price unavailable";
};

const getSourceLabel = (source) => {
  if (!source) return "Unknown source";
  return String(source)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const fallbackImage = "/assets/fallback-product-image.png";

function SearchResultCard({ result, viewMode = "grid", onSaveItem, userId }) {
  const {
    name,
    brand,
    imageUrl,
    productUrl,
    source,
    color,
    size,
    gender,
    category,
    material,
    availability,
  } = result || {};

  const isList = viewMode === "list";
  const detailChips = [brand, category, color, size, gender, material]
    .filter(Boolean)
    .slice(0, 4);

  const handleOpenProduct = () => {
    if (productUrl) {
      window.open(productUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleSave = () => {
    if (onSaveItem) {
      onSaveItem(result);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: isList ? { xs: "column", md: "row" } : "column",
        height: "100%",
        minHeight: isList ? "unset" : 470,
        borderRadius: 3,
        backgroundColor: "#111",
        color: "white",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
        overflow: "hidden",
      }}
    >
      <CardMedia
        component="img"
        image={imageUrl || fallbackImage}
        alt={name || "Search result image"}
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
        sx={{
          width: isList ? { xs: "100%", md: 240 } : "100%",
          height: isList ? { xs: 280, md: "auto" } : 290,
          objectFit: "cover",
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent sx={{ flex: 1, p: 2.25 }}>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mb: 1.5 }}
          >
            <Chip
              label={getSourceLabel(source)}
              size="small"
              sx={{
                bgcolor: "rgba(64,224,208,0.16)",
                color: "turquoise",
                fontWeight: 700,
              }}
            />

            {availability && (
              <Chip
                label={availability}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                }}
              />
            )}
          </Stack>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.75,
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: isList ? "unset" : "3.5rem",
            }}
          >
            {name || "Untitled item"}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.72)", mb: 1.5 }}
          >
            {brand || "Brand unavailable"}
          </Typography>

          <Typography
            variant="h6"
            sx={{ color: "turquoise", fontWeight: 800, mb: 1.5 }}
          >
            {formatPrice(result)}
          </Typography>

          {detailChips.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              sx={{ mb: 1.5 }}
            >
              {detailChips.map((detail, index) => (
                <Chip
                  key={`${detail}-${index}`}
                  label={detail}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.78)",
                  }}
                />
              ))}
            </Stack>
          )}

          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.62)" }}>
            {productUrl
              ? "Open the retailer page to view current availability, shipping, and product details."
              : "Product link unavailable for this result."}
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            px: 2.25,
            pb: 2.25,
            pt: 0,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            endIcon={<LaunchIcon />}
            onClick={handleOpenProduct}
            disabled={!productUrl}
            sx={{
              minHeight: 42,
              px: 2,
              borderRadius: 2,
              bgcolor: "turquoise",
              color: "black",
              fontWeight: 700,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#35d8cb" },
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.4)",
              },
            }}
          >
            View item
          </Button>

          <Button
            variant="outlined"
            startIcon={<FavoriteBorderIcon />}
            onClick={handleSave}
            disabled={!userId || !onSaveItem}
            sx={{
              minHeight: 42,
              px: 2,
              borderRadius: 2,
              textTransform: "none",
              borderColor: "rgba(255,255,255,0.18)",
              color: "white",
              fontWeight: 700,
              "&:hover": {
                borderColor: "turquoise",
                color: "turquoise",
                backgroundColor: "rgba(64,224,208,0.05)",
              },
            }}
          >
            Save
          </Button>
        </CardActions>
      </Box>
    </Card>
  );
}

export default SearchResultCard;
