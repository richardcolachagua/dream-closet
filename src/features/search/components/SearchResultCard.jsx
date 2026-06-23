import React from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LaunchIcon from "@mui/icons-material/Launch";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { colors } from "../../../shared/ui/theme/designTokens";
import {
  interactiveCardSx,
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

const formatPrice = (result) => {
  if (result?.price && String(result.price).trim()) return result.price;
  if (typeof result?.numericPrice === "number")
    return `$${result.numericPrice.toFixed(2)}`;
  return "Price unavailable";
};

const getSourceLabel = (source) => {
  if (!source) return "Unknown source";
  return String(source)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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
    .slice(0, 5);

  const handleSave = () => {
    if (onSaveItem) onSaveItem(result);
  };

  return (
    <Box
      sx={{
        ...interactiveCardSx,
        p: 0,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isList ? { xs: "column", md: "row" } : "column",
          height: "100%",
        }}
      >
        <Box
          sx={{
            width: isList ? { xs: "100%", md: 250 } : "100%",
            minWidth: isList ? { md: 250 } : "auto",
            aspectRatio: isList ? { xs: "4 / 5", md: "auto" } : "4 / 5",
            bgcolor: colors.surface2,
            borderBottom: isList
              ? { xs: `1px solid ${colors.border}`, md: "none" }
              : `1px solid ${colors.border}`,
            borderRight: isList ? { md: `1px solid ${colors.border}` } : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={name || "Search result"}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback = event.currentTarget.nextSibling;
                if (fallback) fallback.style.display = "flex";
              }}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : null}

          <Stack
            spacing={1}
            alignItems="center"
            justifyContent="center"
            sx={{
              display: imageUrl ? "none" : "flex",
              width: "100%",
              height: "100%",
              px: 2,
              color: colors.textMuted,
            }}
          >
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40 }} />
            <Typography sx={{ fontSize: "0.94rem", textAlign: "center" }}>
              Image unavailable
            </Typography>
          </Stack>
        </Box>

        <Stack
          spacing={1.4}
          sx={{ p: 2.25, flex: 1, justifyContent: "space-between" }}
        >
          <Box>
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
                  bgcolor: colors.accentSoft,
                  color: colors.accent,
                  border: `1px solid ${colors.accentBorder}`,
                  fontWeight: 700,
                }}
              />
              {availability ? (
                <Chip
                  label={availability}
                  size="small"
                  sx={{
                    bgcolor: colors.surface2,
                    color: colors.textSecondary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              ) : null}
            </Stack>

            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 800,
                mb: 0.75,
                lineHeight: 1.3,
                fontSize: "1.08rem",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {name || "Untitled item"}
            </Typography>

            <Typography
              sx={{
                color: colors.textMuted,
                mb: 1.2,
                fontSize: "0.95rem",
              }}
            >
              {brand || "Brand unavailable"}
            </Typography>

            <Typography
              sx={{
                color: colors.accent,
                fontWeight: 800,
                mb: 1.5,
                fontSize: "1.08rem",
              }}
            >
              {formatPrice(result)}
            </Typography>

            {detailChips.length > 0 ? (
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
                    sx={{
                      bgcolor: colors.surface2,
                      color: colors.textSecondary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                ))}
              </Stack>
            ) : null}

            <Typography
              sx={{
                color: colors.textSecondary,
                lineHeight: 1.7,
                fontSize: "0.94rem",
              }}
            >
              {productUrl
                ? "Open the retailer page to check current stock, sizing, shipping, and product details."
                : "Product link unavailable for this result."}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ pt: 1 }}
          >
            <Button
              component="a"
              href={productUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<LaunchIcon />}
              disabled={!productUrl}
              sx={{
                ...primaryButtonSx,
                flex: 1,
                minHeight: 44,
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.10)",
                  color: "rgba(255,255,255,0.38)",
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
                ...secondaryButtonSx,
                flex: isList ? { xs: 1, sm: "0 0 auto" } : 1,
                minHeight: 44,
                "&.Mui-disabled": {
                  borderColor: colors.border,
                  color: colors.textFaint,
                },
              }}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

export default SearchResultCard;
