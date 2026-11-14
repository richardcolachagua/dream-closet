import { useEffect, useState } from "react";
import { Alert, Button, CircularProgress, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import SavedItemCard from "./SavedItemCard";
import PageSection from "../../../shared/ui/layout/PageSection";
import { ROUTES } from "../../../app/routes/routePaths";
import { useSavedCollection } from "../useSavedCollection";

export default function SavedItemsList({ userId }) {
  const { user } = useAuth();
  const requestedUid = userId || user?.uid;
  const {
    records,
    loading,
    error,
    remove,
    refresh,
    hasMore,
    loadingMore,
    loadMoreError,
    loadMore,
  } = useSavedCollection("savedItems", requestedUid);
  const [deleteError, setDeleteError] = useState("");
  useEffect(() => setDeleteError(""), [requestedUid]);
  const removeItem = async (id) => {
    setDeleteError("");
    try {
      await remove(id);
    } catch (failure) {
      setDeleteError(failure.message);
    }
  };
  return (
    <PageSection
      eyebrow="Saved items"
      title="Pieces you wanted to revisit"
      description="Revisit products you saved while searching."
      actions={
        <Button component={RouterLink} to={ROUTES.SEARCH}>
          Search for more
        </Button>
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
        <Alert severity="info">You haven’t saved any items yet.</Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {records.map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={3}
                key={item.id}
                sx={{ display: "flex" }}
              >
                <SavedItemCard
                  imageUrl={item.imageUrl}
                  title={item.name}
                  subtitle={item.price}
                  source={item.source}
                  savedItem={item}
                  productUrl={item.productUrl}
                  onRemove={() => removeItem(item.id)}
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
