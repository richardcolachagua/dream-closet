import { Alert, Box, CircularProgress } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { ROUTES, buildCurrentPath } from "../../../app/routes/routePaths";
import CallableSearchWorkspace from "../components/CallableSearchWorkspace";
import { searchIdentity } from "../services/searchSession";

export default function SearchPage() {
  const location = useLocation();
  const { user, loading, isRegistered, profile, profileLoading, profileError } = useAuth();
  if (loading || (isRegistered && profileLoading)) {
    return <Box sx={{ p: 4 }}><CircularProgress /></Box>;
  }
  if (!isRegistered) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: buildCurrentPath(location) }} />;
  }
  if (profileError || !profile) {
    return <Alert severity="error">Your profile is unavailable. Sign out and sign in again.</Alert>;
  }
  return <CallableSearchWorkspace key={searchIdentity(user)} user={user} profile={profile} />;
}
