import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { colors, radius } from "../../../shared/ui/theme/designTokens";

function SearchResultsSkeleton({ viewMode = "grid" }) {
  const isList = viewMode === "list";
  const itemCount = isList ? 4 : 8;

  return (
    <Grid container spacing={2.5}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Grid
          item
          xs={12}
          sm={isList ? 12 : 6}
          lg={isList ? 12 : 4}
          xl={isList ? 12 : 3}
          key={index}
        >
          <Box
            sx={{
              border: `1px solid ${colors.border}`,
              bgcolor: colors.surfaceSoft,
              borderRadius: radius.lg,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isList ? { xs: "column", md: "row" } : "column",
              }}
            >
              <Skeleton
                variant="rectangular"
                animation="wave"
                sx={{
                  width: isList ? { xs: "100%", md: 280 } : "100%",
                  minWidth: isList ? { xs: "100%", md: 280 } : "auto",
                  height: isList ? { xs: 300, md: 280 } : 320,
                  bgcolor: colors.surface2,
                }}
              />

              <Stack spacing={1.25} sx={{ p: 2.25, flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="78%"
                  height={34}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="42%"
                  height={24}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="30%"
                  height={28}
                  animation="wave"
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Skeleton
                    variant="rounded"
                    width={78}
                    height={28}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rounded"
                    width={92}
                    height={28}
                    animation="wave"
                  />
                  <Skeleton
                    variant="rounded"
                    width={70}
                    height={28}
                    animation="wave"
                  />
                </Stack>

                <Skeleton
                  variant="text"
                  width="100%"
                  height={22}
                  animation="wave"
                />
                <Skeleton
                  variant="text"
                  width="88%"
                  height={22}
                  animation="wave"
                />

                <Stack
                  direction={{ xs: "column", sm: isList ? "row" : "column" }}
                  spacing={1}
                  sx={{ pt: 1 }}
                >
                  <Skeleton variant="rounded" height={44} animation="wave" />
                  <Skeleton variant="rounded" height={44} animation="wave" />
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default SearchResultsSkeleton;
