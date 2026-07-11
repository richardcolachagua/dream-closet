import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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

import ContactPage from "../features/legal/pages/ContactPage";
import PrivacyPolicyPage from "../features/legal/pages/PrivacyPolicyPage";
import TermsOfServicePage from "../features/legal/pages/TermsOfServicePage";

import OnboardingGenderPage from "../features/onboarding/pages/OnboardingGenderPage";
import OnboardingCategoriesPage from "../features/onboarding/pages/OnboardingCategoriesPage";
import OnboardingBrandsPage from "../features/onboarding/pages/OnboardingBrandsPage";

import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import SubscriptionGuard from "../features/pricing/components/SubscriptionGuard";
import { OnboardingGuard } from "../features/onboarding/OnboardingGuard";
import { ROUTES, DEFAULT_PUBLIC_ROUTE } from "./routes/routePaths";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTES.ROOT}
        element={<Navigate to={ROUTES.HOME} replace />}
      />
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.FREE_SEARCH} element={<FreeSearchPage />} />
      <Route path={ROUTES.PRICING} element={<PricingPage />} />
      <Route path={ROUTES.CONTACT} element={<ContactPage />} />
      <Route path={ROUTES.PRIVACY_POLICY} element={<PrivacyPolicyPage />} />
      <Route path={ROUTES.TERMS} element={<TermsOfServicePage />} />
      <Route path={ROUTES.PASSWORD_SUCCESS} element={<SuccessfulPage />} />

      {/* Guest-only auth routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <ProtectedRoute inverse>
            <LoginPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SIGNUP}
        element={
          <ProtectedRoute inverse>
            <SignUpPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.FORGOT_PASSWORD}
        element={
          <ProtectedRoute inverse>
            <ForgotPasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Onboarding routes */}
      <Route
        path={ROUTES.ONBOARDING_GENDER}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <OnboardingGenderPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ONBOARDING_CATEGORIES}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <OnboardingCategoriesPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ONBOARDING_BRANDS}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <OnboardingBrandsPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      {/* Protected app routes */}
      <Route
        path={ROUTES.SEARCH}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <SearchPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfilePage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SAVED}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <SavedItemsAndSearches />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SETTINGS}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ProfilePage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.SEARCH}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <SearchPage />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      {/* Subscription-gated route */}
      <Route
        path="/premium-search"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <SubscriptionGuard>
                <SearchPage />
              </SubscriptionGuard>
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      {/* 404 / fallback */}
      <Route
        path={ROUTES.NOT_FOUND}
        element={<Navigate to={ROUTES.HOME} replace />}
      />
      <Route
        path="*"
        element={<Navigate to={DEFAULT_PUBLIC_ROUTE} replace />}
      />
    </Routes>
  );
}

export default App;
