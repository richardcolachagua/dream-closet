import React from "react";
import { Box, Pagination } from "@mui/material";

function ResultsPagination({
  totalItems = 0,
  page = 1,
  pageSize = 5,
  onPageChange,
}) {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => onPageChange?.(value)}
        color="primary"
      />
    </Box>
  );
}

export default ResultsPagination;
