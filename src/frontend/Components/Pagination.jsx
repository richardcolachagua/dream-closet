import { Pagination } from "@mui/material";
import { useState } from "react";

const pageSize = 5; // Show 5 per page
const [page, setPage] = useState(1);

const paginatedSearches = savedSearches.slice(
  (page - 1) * pageSize,
  page * pageSize
);

return (
  <Pagination
    count={Math.ceil(savedSearches.length / pageSize)}
    page={page}
    onChange={(event, value) => setPage(value)}
    color="primary"
  />

  // Use paginatedSearches instead of savedSearches when mapping over your UI
);
