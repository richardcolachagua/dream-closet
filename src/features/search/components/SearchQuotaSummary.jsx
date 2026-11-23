import { Box, Button, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ROUTES } from "../../../app/routes/routePaths";
import { colors } from "../../../shared/ui/theme/designTokens";

export const formatQuotaReset = (quota) => {
  if (!quota?.resetAt) return null;
  const date = new Date(quota.resetAt);
  if (!Number.isFinite(date.getTime())) return null;
  const free = quota.tier === "free";
  return {
    label: free ? "Daily allowance renews" : "Next visitor slot opens",
    value: date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      ...(free ? { timeZone: "America/New_York", timeZoneName: "short" } : {}),
    }),
    exact: free
      ? date.toLocaleString("en-US", {
          timeZone: "America/New_York",
          timeZoneName: "short",
        })
      : date.toLocaleString(),
  };
};

export default function SearchQuotaSummary({
  quota,
  loading = false,
  registered = false,
  canRefine = false,
}) {
  const exhausted = quota?.remaining === 0 && !quota?.unlimited;
  const reset = formatQuotaReset(quota);
  const label = loading
    ? "Checking your search allowance…"
    : !quota
      ? "Search allowance unavailable"
      : quota.unlimited
        ? "Pro · Unlimited daily searches"
        : `${quota.remaining} of ${quota.limit} new searches left`;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        bgcolor: colors.surface,
        border: `1px solid ${exhausted ? "#715d36" : colors.border}`,
      }}
    >
      <Stack spacing={1.25}>
        <Box role="status" aria-live="polite" aria-atomic="true">
          <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>
            {label}
          </Typography>
          {!loading && reset && !quota?.unlimited && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {reset.label}:{" "}
              <Box
                component="time"
                dateTime={quota.resetAt}
                title={reset.exact}
              >
                {reset.value}
              </Box>
            </Typography>
          )}
          {!loading && exhausted && (
            <Typography variant="body2" sx={{ mt: 0.75, color: "#f3cf7a" }}>
              {canRefine
                ? "You can still filter, sort, or retry your current search."
                : "Wait for your allowance to renew before starting a new search."}
            </Typography>
          )}
        </Box>
        {!registered && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="body2" color="text.secondary">
              Free accounts get 5 searches per day, saved items, and a style
              profile.
            </Typography>
            <Button
              size="small"
              component={RouterLink}
              to={ROUTES.SIGNUP}
              sx={{ flexShrink: 0 }}
            >
              Create free account
            </Button>
          </Stack>
        )}
        {registered && exhausted && (
          <Button
            component={RouterLink}
            to={ROUTES.PRICING}
            sx={{ alignSelf: "flex-start" }}
          >
            Explore Pro
          </Button>
        )}
        <Box
          component="details"
          sx={{ color: colors.textSecondary, fontSize: "0.875rem" }}
        >
          <Box
            component="summary"
            sx={{
              cursor: "pointer",
              color: colors.accent,
              py: 0.5,
              "&:focus-visible": {
                outline: `2px solid ${colors.accent}`,
                outlineOffset: 3,
              },
            }}
          >
            How search limits work
          </Box>
          <Stack spacing={0.75} sx={{ pt: 1, maxWidth: 760 }}>
            <Typography variant="body2">
              Visitors get 3 searches in a rolling 24 hours. Each search slot
              returns individually 24 hours after use.
            </Typography>
            <Typography variant="body2">
              Registered Free accounts get a separate allowance of 5 searches
              per calendar day, renewing at midnight New York time.
            </Typography>
            <Typography variant="body2">
              Only a new text-search operation uses another allowance. Sorting,
              filters, pagination, and retries reuse the current reservation for
              up to 24 hours.
            </Typography>
            <Typography variant="body2">
              Processed search failures use quota. Refreshing or reopening a
              search URL starts a new operation. Pro has no daily search quota;
              request-rate controls still apply.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
