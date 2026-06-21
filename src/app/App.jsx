import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";
import LoginPage from "../features/pages/LoginPage";
import SignUpPage from "../features/pages/SignUpPage";
import ForgotPasswordPage from "../features/pages/ForgotPassword";
import SuccessfulPage from "../features/pages/SuccessfulPage";
import HomePage from "../features/home/pages/HomePage";
import SearchPage from "../features/search/pages/SearchPage";
import SavedItemsAndSearches from "../features/saved/pages/SavedSearchDetailPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import FreeSearchPage from "../features/search/pages/FreeSearchPage";
import PricingPage from "../features/pricing/pages/PricingPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { SubscriptionGuard } from "../features/pricing/components/SubscriptionGuard";
import { OnboardingGuard } from "../features/onboarding/OnboardingGuard";
import { ROUTES } from "./routes/routePaths";

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    const destination = location.state?.from || ROUTES.SEARCH;
    return <Navigate to={destination} replace />;
  }

  return children;
}

const routeConfigs = [
  {
    path: ROUTES.HOME,
    element: <HomePage />,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.SIGNUP,
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: ROUTES.SUCCESSFUL,
    element: <SuccessfulPage />,
  },
  {
    path: ROUTES.FREE_SEARCH,
    element: <FreeSearchPage />,
  },
  {
    path: ROUTES.PRICING,
    element: <PricingPage />,
  },
  {
    path: ROUTES.SEARCH,
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <SearchPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <ProfilePage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.SAVED_SEARCH_DETAIL,
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <SavedItemsAndSearches />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.PREMIUM_SEARCH,
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <SubscriptionGuard>
            <SearchPage />
          </SubscriptionGuard>
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },
];

function App() {
  return (
    <Routes>
      {routeConfigs.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}

export default App;
