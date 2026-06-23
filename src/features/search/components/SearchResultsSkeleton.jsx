import React from "react";
import { Box, Grid, Skeleton, Stack } from "@mui/material";
import { colors } from "../../../shared/ui/theme/designTokens";

function SearchResultsSkeleton({ viewMode = "grid" }) {
  const itemCount = viewMode === "list" ? 4 : 8;

  return (
    <Grid container spacing={3}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Grid
          key={index}
          item
          xs={12}
          sm={viewMode === "list" ? 12 : 6}
          lg={viewMode === "list" ? 12 : 4}
        >
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              bgcolor: colors.surfaceSoft,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Skeleton
              variant="rectangular"
              height={viewMode === "list" ? 260 : 300}
              animation="wave"
            />
            <Box sx={{ p: 2.25 }}>
              <Stack spacing={1.1}>
                <Skeleton height={28} width="32%" animation="wave" />
                <Skeleton height={34} width="86%" animation="wave" />
                <Skeleton height={26} width="45%" animation="wave" />
                <Skeleton height={24} width="100%" animation="wave" />
                <Skeleton height={24} width="78%" animation="wave" />
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Skeleton height={42} width={120} animation="wave" />
                  <Skeleton height={42} width={100} animation="wave" />
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
