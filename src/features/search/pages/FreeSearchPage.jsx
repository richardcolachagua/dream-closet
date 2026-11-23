import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ROUTES } from "../../../app/routes/routePaths";
import { ensureVisitorSession, searchIdentity } from "../services/searchSession";
import CallableSearchWorkspace from "../components/CallableSearchWorkspace";

export default function FreeSearchPage() {
  const { user, loading, isRegistered } = useAuth();
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (loading || user) return undefined;
    let active = true;
    setError(null);
    ensureVisitorSession().catch((failure) => {
      if (active) setError(failure);
    });
    return () => { active = false; };
  }, [loading, user, attempt]);

  if (loading) return <Box sx={{ p: 4 }}><CircularProgress /></Box>;
  if (isRegistered) return <Navigate to={ROUTES.SEARCH} replace />;
  if (error && !user) {
    return <Alert severity="error" action={
      <Button onClick={() => setAttempt((value) => value + 1)}>Retry</Button>
    }>Visitor sign-in failed. Confirm anonymous authentication is enabled.</Alert>;
  }
  if (!user) return <Box sx={{ p: 4 }}><CircularProgress /> Preparing visitor search...</Box>;
  return <CallableSearchWorkspace key={searchIdentity(user)} user={user} />;
}
