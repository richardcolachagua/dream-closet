import React from "react";
import { Box, Button, Chip, Stack, Tooltip, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LaunchIcon from "@mui/icons-material/Launch";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  interactiveCardSx,
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

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

const getDetailValues = (result = {}) => {
  const values = [
    result?.brand,
    result?.category,
    ...(Array.isArray(result?.color)
      ? result.color
      : result?.color
        ? [result.color]
        : []),
    ...(Array.isArray(result?.size)
      ? result.size
      : result?.size
        ? [result.size]
        : []),
    result?.gender,
    ...(Array.isArray(result?.material)
      ? result.material
      : result?.material
        ? [result.material]
        : []),
  ];

  return [...new Set(values.filter(Boolean))].slice(0, 5);
};

function SearchResultCard({ result, viewMode = "grid", onSaveItem, userId }) {
  const { name, brand, imageUrl, productUrl, source, availability } =
    result || {};

  const isList = viewMode === "list";
  const detailChips = getDetailValues(result);
  const canSave = Boolean(userId && onSaveItem);
  const hasProductUrl = Boolean(productUrl);

  const handleSave = () => {
    if (canSave) onSaveItem(result);
  };

  return (
    <Box
      sx={{
        ...interactiveCardSx,
        display: "flex",
        flexDirection: isList ? { xs: "column", md: "row" } : "column",
        overflow: "hidden",
        minHeight: "100%",
        p: 0,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: isList ? { xs: "100%", md: 280 } : "100%",
          minWidth: isList ? { xs: "100%", md: 280 } : "auto",
          aspectRatio: isList ? { xs: "4 / 5", md: "3 / 4" } : "4 / 5",
          bgcolor: colors.surface2,
          borderBottom: isList
            ? { xs: `1px solid ${colors.border}`, md: "none" }
            : `1px solid ${colors.border}`,
          borderRight: isList
            ? { xs: "none", md: `1px solid ${colors.border}` }
            : "none",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          <>
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
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{
                display: "none",
                position: "absolute",
                inset: 0,
                color: colors.textMuted,
                px: 2,
                textAlign: "center",
              }}
            >
              <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40 }} />
              <Typography sx={{ fontSize: "0.95rem" }}>
                Image unavailable
              </Typography>
            </Stack>
          </>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{
              height: "100%",
              color: colors.textMuted,
              px: 2,
              textAlign: "center",
            }}
          >
            <ImageNotSupportedOutlinedIcon sx={{ fontSize: 40 }} />
            <Typography sx={{ fontSize: "0.95rem" }}>
              Image unavailable
            </Typography>
          </Stack>
        )}
      </Box>

      <Stack spacing={1.2} sx={{ p: 2.25, flex: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
        >
          <Stack spacing={0.8} sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: colors.textPrimary,
                fontWeight: 800,
                fontSize: "1.02rem",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {name || "Untitled item"}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <StorefrontRoundedIcon
                sx={{ color: colors.textMuted, fontSize: 17 }}
              />
              <Typography
                sx={{
                  color: colors.textMuted,
                  fontSize: "0.92rem",
                }}
              >
                {getSourceLabel(source)}
              </Typography>
            </Stack>
          </Stack>

          {availability ? (
            <Chip
              label={String(availability).replace(/_/g, " ")}
              size="small"
              sx={{
                textTransform: "capitalize",
                bgcolor:
                  availability === "in_stock"
                    ? "rgba(110, 231, 183, 0.14)"
                    : colors.surface2,
                color:
                  availability === "in_stock"
                    ? colors.success || "#7DFFB3"
                    : colors.textSecondary,
                border: `1px solid ${colors.border}`,
                fontWeight: 700,
              }}
            />
          ) : null}
        </Stack>

        <Typography
          sx={{
            color: colors.accent,
            fontWeight: 800,
            fontSize: "1rem",
          }}
        >
          {formatPrice(result)}
        </Typography>

        <Typography
          sx={{
            color: colors.textSecondary,
            fontSize: "0.94rem",
            lineHeight: 1.7,
          }}
        >
          {brand || "Brand unavailable"}
        </Typography>

        {detailChips.length > 0 ? (
          <Stack direction="row" spacing={0.9} flexWrap="wrap" useFlexGap>
            {detailChips.map((detail, index) => (
              <Chip
                key={`${detail}-${index}`}
                label={String(detail)}
                size="small"
                sx={{
                  bgcolor: colors.surface2,
                  color: colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        ) : null}

        <Typography
          sx={{
            color: colors.textMuted,
            fontSize: "0.9rem",
            lineHeight: 1.65,
          }}
        >
          {hasProductUrl
            ? "Open the retailer page to confirm stock, sizing, shipping, and current product details."
            : "Product link unavailable for this result."}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: isList ? "row" : "column" }}
          spacing={1}
          sx={{ pt: 0.75, mt: "auto" }}
        >
          <Button
            component={hasProductUrl ? "a" : "button"}
            href={hasProductUrl ? productUrl : undefined}
            target={hasProductUrl ? "_blank" : undefined}
            rel={hasProductUrl ? "noopener noreferrer" : undefined}
            variant="contained"
            endIcon={<LaunchIcon />}
            disabled={!hasProductUrl}
            sx={{
              ...primaryButtonSx,
              flex: 1,
              minHeight: 44,
              "&.Mui-disabled": {
                bgcolor: colors.surface2,
                color: colors.textFaint,
              },
            }}
          >
            View item
          </Button>

          <Tooltip title={canSave ? "Save for later" : "Sign in to save items"}>
            <span
              style={{
                display: isList ? "inline-flex" : "block",
                flex: isList ? 1 : undefined,
              }}
            >
              <Button
                onClick={handleSave}
                disabled={!canSave}
                startIcon={<FavoriteBorderIcon />}
                sx={{
                  ...secondaryButtonSx,
                  width: "100%",
                  minHeight: 44,
                  "&.Mui-disabled": {
                    borderColor: colors.border,
                    color: colors.textFaint,
                  },
                }}
              >
                Save
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
}

export default SearchResultCard;
