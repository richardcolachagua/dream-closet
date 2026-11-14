import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Grid, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import SavedSearchCard from "./SavedSearchCard";
import PageSection from "../../../shared/ui/layout/PageSection";
import { buildSearchStateQuery } from "../../search/utils/searchStateHelpers";
import { ROUTES } from "../../../app/routes/routePaths";
import { useSavedSearches } from "../SavedSearchesContext";

export default function SavedSearchesList() {
  const { user } = useAuth();
  const {
    savedSearches: records,
    loading,
    error,
    deleteSavedSearch: remove,
    refresh,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  } = useSavedSearches();
  const navigate = useNavigate();
  const [selection, setSelection] = useState({ uid: user?.uid, ids: [] });
  const selected = selection.uid === user?.uid ? selection.ids : [];
  const [deleteError, setDeleteError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setSelection({ uid: user?.uid, ids: [] });
    setDeleteError("");
  }, [user?.uid]);
  const deleteIds = async (ids) => {
    setBusy(true);
    setDeleteError("");
    const outcomes = await Promise.allSettled(ids.map((id) => remove(id)));
    const failed = ids.filter(
      (_id, index) => outcomes[index].status === "rejected",
    );
    setSelection({ uid: user?.uid, ids: failed });
    if (failed.length)
      setDeleteError(
        `${failed.length} saved searches could not be removed. Retry the selection.`,
      );
    setBusy(false);
  };
  const toggle = (id) =>
    setSelection({
      uid: user?.uid,
      ids: selected.includes(id)
        ? selected.filter((value) => value !== id)
        : [...selected, id],
    });
  const rerun = (search) => {
    const query = buildSearchStateQuery({
      query: search.query,
      filters: search.filters,
      sort: search.sort,
      page: search.page,
    });
    navigate(`${ROUTES.SEARCH}?${query}`);
  };
  const formatDate = (value) => {
    const date =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value instanceof Date
          ? value
          : typeof value === "string" || typeof value === "number"
            ? new Date(value)
            : null;
    return date && Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date)
      : null;
  };
  return (
    <PageSection
      eyebrow="Saved searches"
      title="Searches worth coming back to"
      description="Rerun saved search ideas without starting over."
      actions={
        <Stack direction="row" spacing={1}>
          <Button onClick={() => navigate(ROUTES.SEARCH)}>New search</Button>
          {selected.length > 0 && (
            <Button disabled={busy} onClick={() => deleteIds(selected)}>
              Delete {selected.length} selected
            </Button>
          )}
        </Stack>
      }
    >
      {deleteError && <Alert severity="error">{deleteError}</Alert>}
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert
          severity="error"
          action={<Button onClick={refresh}>Retry</Button>}
        >
          {error}
        </Alert>
      ) : !records.length ? (
        <Alert severity="info">No saved searches yet.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {records.map((search) => (
              <Grid item xs={12} md={6} lg={4} key={search.id}>
                <SavedSearchCard
                  query={search.query}
                  filters={search.filters}
                  sort={search.sort}
                  page={search.page}
                  date={formatDate(search.createdAt)}
                  onDelete={() => {
                    if (!busy) void deleteIds([search.id]);
                  }}
                  onClick={() => rerun(search)}
                  selected={selected.includes(search.id)}
                  onSelect={() => {
                    if (!busy) toggle(search.id);
                  }}
                />
              </Grid>
            ))}
          </Grid>
          {loadMoreError && <Alert severity="error">{loadMoreError}</Alert>}
          {hasMore && (
            <Button onClick={loadMore} disabled={loadingMore} sx={{ mt: 2 }}>
              {loadingMore ? "Loading..." : "Load more"}
            </Button>
          )}
        </>
      )}
    </PageSection>
  );
}
