import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./backend/AuthContext";
import { ProtectedRoute } from "./backend/ProtectedRoute";
import { OnboardingGuard } from "./backend/OnboardingGuard";
import { SubscriptionGuard } from "./backend/SubscriptionGuard";

import HomePage from "./frontend/Pages/StaticPages/HomePage";
import ContactPage from "./frontend/Pages/StaticPages/ContactPage";
import LoginPage from "./frontend/Pages/AuthPages/LoginPage";
import SignUpPage from "./frontend/Pages/AuthPages/SignUpPage";
import LogoutPage from "./frontend/Pages/AuthPages/LogoutPage";
import NotFoundPage from "./frontend/Pages/StaticPages/NotFoundPage";
import PricingPage from "./frontend/Pages/Pricing/PricingPage";
import ProfilePage from "./frontend/Pages/UserPages/ProfilePage";
import PrivacyPolicyPage from "./frontend/Pages/StaticPages/PrivacyPolicyPage";
import SearchPage from "./frontend/Pages/SearchPages/SearchPage";
import TOSPage from "./frontend/Pages/StaticPages/TOS-Page";
import FreeSearchPage from "./frontend/Pages/SearchPages/FreeSearchPage";
import SavedItemsAndSearches from "./frontend/Pages/UserPages/SavedSearchItemPage";
import ForgotPassword from "./frontend/Pages/ForgotPassword/ForgotPassword";
import SmoothScroll from "./frontend/ScrollingAnimation/SmoothScroll";
import CheckYourEmail from "./frontend/Pages/ForgotPassword/CheckYourEmail";
import PasswordReset from "./frontend/Pages/ForgotPassword/PasswordReset";
import SetANewPassword from "./frontend/Pages/ForgotPassword/SetANewPassword";
import SuccessfulPage from "./frontend/Pages/ForgotPassword/SuccessfulPage";
import OnboardingGender from "./frontend/Pages/Onboarding/OnboardingGender";
import OnboardingCategories from "./frontend/Pages/Onboarding/OnboardingCategories";
import OnboardingBrands from "./frontend/Pages/Onboarding/OnboardingBrands";

const ProtectedAppRoute = ({ children, roles = [] }) => (
  <ProtectedRoute roles={roles}>
    <OnboardingGuard>{children}</OnboardingGuard>
  </ProtectedRoute>
);

const ProtectedOnboardingRoute = ({ children, roles = [] }) => (
  <ProtectedRoute roles={roles}>{children}</ProtectedRoute>
);

const PublicOnlyRoute = ({ children }) => (
  <ProtectedRoute inverse redirectPath="/searchpage">
    {children}
  </ProtectedRoute>
);

const ROUTES = [
  { path: "/", element: <Navigate to="/homepage" replace /> },
  { path: "/homepage", element: <HomePage /> },
  { path: "/contactpage", element: <ContactPage /> },
  { path: "/pricing", element: <PricingPage /> },

  {
    path: "/loginpage",
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/signuppage",
    element: (
      <PublicOnlyRoute>
        <SignUpPage />
      </PublicOnlyRoute>
    ),
  },
  { path: "/logoutpage", element: <LogoutPage /> },
  { path: "/freesearchpage", element: <FreeSearchPage /> },
  { path: "/privacypolicypage", element: <PrivacyPolicyPage /> },
  { path: "/tospage", element: <TOSPage /> },
  {
    path: "/forgotpassword",
    element: (
      <PublicOnlyRoute>
        <ForgotPassword />
      </PublicOnlyRoute>
    ),
  },
  { path: "/checkyouremail", element: <CheckYourEmail /> },
  { path: "/passwordreset", element: <PasswordReset /> },
  { path: "/setpassword", element: <SetANewPassword /> },
  { path: "/successful", element: <SuccessfulPage /> },

  {
    path: "/profilepage",
    element: (
      <ProtectedAppRoute>
        <ProfilePage />
      </ProtectedAppRoute>
    ),
  },

  {
    path: "/searchpage",
    element: (
      <ProtectedRoute>
        <OnboardingGuard>
          <SearchPage />
        </OnboardingGuard>
      </ProtectedRoute>
    ),
  },

  {
    path: "/saveditemsandsearches",
    element: (
      <ProtectedAppRoute>
        <SavedItemsAndSearches />
      </ProtectedAppRoute>
    ),
  },

  {
    path: "/onboarding/gender",
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingGender />
      </ProtectedOnboardingRoute>
    ),
  },
  {
    path: "/onboarding/categories",
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingCategories />
      </ProtectedOnboardingRoute>
    ),
  },
  {
    path: "/onboarding/brands",
    element: (
      <ProtectedOnboardingRoute>
        <OnboardingBrands />
      </ProtectedOnboardingRoute>
    ),
  },

  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
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
            {ROUTES.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </SmoothScroll>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
