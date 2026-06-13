import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "../features/auth/AuthContext";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { OnboardingGuard } from "../features/onboarding/OnboardingGuard";
// import { SubscriptionGuard } from "./backend/SubscriptionGuard";

import { ROUTES, DEFAULT_AUTHENTICATED_ROUTE } from "../app/routes/routePaths";

import HomePage from "../features/home/pages/HomePage";
import ContactPage from "../features/legal/pages/ContactPage";
import LoginPage from "../features/pages/LoginPage";
import SignUpPage from "../features/pages/SignUpPage";
import LogoutPage from "../features/pages/LogoutPage";
import NotFoundPage from "../app/routes/NotFoundPage";
import PricingPage from "../features/pricing/pages/PricingPage";
import ProfilePage from "../features/profile/pages/ProfilePage";
import PrivacyPolicyPage from "../features/legal/pages/PrivacyPolicyPage";
import SearchPage from "../features/search/pages/SearchPage";
import TOSPage from "../features/legal/pages/TermsOfServicePage";
import FreeSearchPage from "../features/search/pages/FreeSearchPage";
import SavedItemsAndSearches from "../features/saved/pages/SavedSearchDetailPage";
import ForgotPassword from "../features/pages/ForgotPassword";
import SmoothScroll from "../shared/ui/feedback/SmoothScroll";
import CheckYourEmail from "../features/pages/CheckYourEmailNotice";
import PasswordReset from "../features/pages/PasswordResetPage";
import SetANewPassword from "../features/pages/SetANewPasswordPage";
import SuccessfulPage from "../features/pages/SuccessfulPage";
import OnboardingGender from "../features/onboarding/pages/OnboardingGenderPage";
import OnboardingCategories from "../features/onboarding/pages/OnboardingCategoriesPage";
import OnboardingBrands from "../features/onboarding/pages/OnboardingBrandsPage";

const ProtectedAppRoute = ({ children, roles = [] }) => (
  <ProtectedRoute roles={roles}>
    <OnboardingGuard>{children}</OnboardingGuard>
  </ProtectedRoute>
);

const ProtectedOnboardingRoute = ({ children, roles = [] }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

const PublicOnlyRoute = ({ children }) => (
  <ProtectedRoute inverse redirectPath={DEFAULT_AUTHENTICATED_ROUTE}>
    {children}
  </ProtectedRoute>
);

const appRoutes = [
  { path: ROUTES.ROOT, element: <Navigate to={ROUTES.HOME} replace /> },

  { path: ROUTES.HOME, element: <HomePage /> },
  { path: ROUTES.CONTACT, element: <ContactPage /> },
  { path: ROUTES.PRICING, element: <PricingPage /> },
  { path: ROUTES.FREE_SEARCH, element: <FreeSearchPage /> },
  { path: ROUTES.PRIVACY_POLICY, element: <PrivacyPolicyPage /> },
  { path: ROUTES.TERMS, element: <TOSPage /> },
  { path: ROUTES.CHECK_EMAIL, element: <CheckYourEmail /> },
  { path: ROUTES.PASSWORD_RESET, element: <PasswordReset /> },
  { path: ROUTES.SET_PASSWORD, element: <SetANewPassword /> },
  { path: ROUTES.PASSWORD_SUCCESS, element: <SuccessfulPage /> },
  { path: ROUTES.LOGOUT, element: <LogoutPage /> },

  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.SIGN_UP,
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: (
      <PublicOnlyRoute>
        <ForgotPassword />
      </PublicOnlyRoute>
    ),
  },

  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedAppRoute>
        <ProfilePage />
      </ProtectedAppRoute>
    ),
  },
  {
    path: ROUTES.SEARCH,
    element: (
      <ProtectedAppRoute>
        <SearchPage />
      </ProtectedAppRoute>
    ),
  },
  {
    path: ROUTES.SAVED,
    element: (
      <ProtectedAppRoute>
        <SavedItemsAndSearches />
      </ProtectedAppRoute>
    ),
  },

  {
    path: ROUTES.ONBOARDING_GENDER,
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingGender />
      </ProtectedOnboardingRoute>
    ),
  },
  {
    path: ROUTES.ONBOARDING_CATEGORIES,
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingCategories />
      </ProtectedOnboardingRoute>
    ),
  },
  {
    path: ROUTES.ONBOARDING_BRANDS,
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingBrands />
      </ProtectedOnboardingRoute>
    ),
  },

  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
  { path: "*", element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
];

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SmoothScroll>
          <Routes>
            {appRoutes.map(({ id, path, element }) => (
              <Route key={id} path={path} element={element} />
            ))}
          </Routes>
        </SmoothScroll>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
