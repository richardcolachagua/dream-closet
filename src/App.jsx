import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./backend/AuthContext";
import { ProtectedRoute } from "./backend/ProtectedRoute";
import { auth } from "./backend/firebase";

import HomePage from "./frontend/Pages/StaticPages/HomePage";
import ContactPage from "./frontend/Pages/StaticPages/ContactPage";
import LoginPage from "./frontend/Pages/AuthPages/LoginPage";
import SignUpPage from "./frontend/Pages/AuthPages/SignUpPage";
import LogoutPage from "./frontend/Pages/AuthPages/LogoutPage";
import NotFoundPage from "./frontend/Pages/StaticPages/PageNotFound";
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

const currentUser = auth.currentUser;

const ROUTES = [
  { path: "/", element: <Navigate to="/homepage" replace /> },
  { path: "/homepage", element: <HomePage /> },
  { path: "/contactpage", element: <ContactPage /> },
  { path: "/loginpage", element: <LoginPage /> },
  { path: "/signuppage", element: <SignUpPage /> },
  { path: "/logoutpage", element: <LogoutPage /> },
  { path: "/freesearchpage", element: <FreeSearchPage /> },
  { path: "/privacypolicypage", element: <PrivacyPolicyPage /> },
  { path: "/tospage", element: <TOSPage /> },
  { path: "/forgotpassword", element: <ForgotPassword /> },
  { path: "/checkyouremail", element: <CheckYourEmail /> },
  { path: "/passwordreset", element: <PasswordReset /> },
  { path: "/setpassword", element: <SetANewPassword /> },
  { path: "/successful", element: <SuccessfulPage /> },

  {
    path: "/profilepage",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/searchpage",
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/saveditemsandsearches",
    element: (
      <ProtectedRoute>
        <SavedItemsAndSearches userId={currentUser?.uid} />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/gender",
    element: (
      <ProtectedRoute>
        <OnboardingGender />
      </ProtectedRoute>
    ),
  },
  {
    path: "/onboarding/categories",
    element: (
      <ProtectedRoute>
        <OnboardingCategories />
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <Navigate to="/homepage" replace /> },
];

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SmoothScroll>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Routes>
            {ROUTES.map(({ path, element }) => (
              <Route key={path} path={path.toLowerCase()} element={element} />
            ))}
          </Routes>
        </AuthProvider>
      </QueryClientProvider>
    </SmoothScroll>
  );
}

export default App;
