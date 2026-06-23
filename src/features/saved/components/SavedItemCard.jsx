import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ImageNotSupportedOutlinedIcon from "@mui/icons-material/ImageNotSupportedOutlined";
import { colors, radius } from "../../../shared/ui/theme/designTokens";
import {
  interactiveCardSx,
  primaryButtonSx,
  secondaryButtonSx,
} from "../../../shared/ui/theme/componentStyles";

const buildSourceLabel = (source) => {
  if (!source) return "Unknown retailer";
  return String(source).replace(/[_-]/g, " ");
};

function SavedItemCard({
  imageUrl,
  title,
  subtitle,
  source,
  productUrl,
  badge,
  onRemove,
  savedItem,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const description = useMemo(() => {
    return (
      savedItem?.description ||
      "Saved from your Dream Closet results so you can revisit it later."
    );
  }, [savedItem]);

  const handleCopyLink = async () => {
    if (!productUrl) return;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Failed to copy product URL", error);
    }
  };

  return (
    <>
      <Box
        sx={{
          ...interactiveCardSx,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: "100%",
          p: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio: "4 / 5",
            bgcolor: colors.surface2,
            borderBottom: `1px solid ${colors.border}`,
            overflow: "hidden",
            cursor: imageUrl ? "zoom-in" : "default",
          }}
          onClick={() => imageUrl && setPreviewOpen(true)}
        >
          {badge ? (
            <Chip
              label={badge}
              size="small"
              sx={{
                position: "absolute",
                top: 14,
                left: 14,
                zIndex: 2,
                bgcolor: colors.accent,
                color: "#061111",
                fontWeight: 800,
              }}
            />
          ) : null}

          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={title || "Saved item"}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ height: "100%", color: colors.textMuted, px: 2 }}
            >
              <ImageNotSupportedOutlinedIcon sx={{ fontSize: 38 }} />
              <Typography sx={{ fontSize: "0.95rem", textAlign: "center" }}>
                No image available
              </Typography>
            </Stack>
          )}
        </Box>

        <Stack spacing={1.1} sx={{ p: 2.25, flex: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: colors.textPrimary,
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  lineHeight: 1.35,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {title || "Untitled item"}
              </Typography>

              {subtitle ? (
                <Typography
                  sx={{
                    color: colors.accent,
                    fontWeight: 700,
                    mt: 0.75,
                    fontSize: "0.98rem",
                  }}
                >
                  {subtitle}
                </Typography>
              ) : null}
            </Box>

            <Tooltip title="Remove item">
              <IconButton
                onClick={onRemove}
                aria-label="Remove saved item"
                sx={{
                  color: colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.surfaceSoft,
                  "&:hover": {
                    color: colors.danger,
                    borderColor: "rgba(255,127,150,0.35)",
                    bgcolor: "rgba(255,127,150,0.08)",
                  },
                }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Typography
            sx={{
              color: colors.textMuted,
              fontSize: "0.92rem",
              lineHeight: 1.65,
            }}
          >
            {buildSourceLabel(source)}
          </Typography>

          <Typography
            sx={{
              color: colors.textSecondary,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ pt: 1.2, mt: "auto" }}>
            <Button
              component="a"
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<OpenInNewIcon />}
              sx={{ ...primaryButtonSx, flex: 1, minHeight: 44 }}
            >
              View item
            </Button>

            <Tooltip title={copied ? "Copied" : "Copy link"}>
              <IconButton
                onClick={handleCopyLink}
                aria-label="Copy item link"
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: radius.md,
                  border: `1px solid ${colors.borderStrong}`,
                  color: copied ? colors.accent : colors.textPrimary,
                  bgcolor: copied ? colors.accentSoft : "transparent",
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            bgcolor: colors.surface,
            color: colors.textPrimary,
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {title || "Saved item"}
        </DialogTitle>
        <DialogContent>
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={title || "Saved item"}
              sx={{
                width: "100%",
                borderRadius: radius.md,
                mb: 2,
                objectFit: "cover",
              }}
            />
          ) : null}

          <Typography
            sx={{ color: colors.textSecondary, lineHeight: 1.75, mb: 2 }}
          >
            {description}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              component="a"
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={primaryButtonSx}
            >
              Open retailer page
            </Button>
            <Button
              variant="outlined"
              onClick={handleCopyLink}
              sx={secondaryButtonSx}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SavedItemCard;
