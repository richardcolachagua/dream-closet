import { Route, Routes } from "react-router-dom";
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
import { QueryClient, QueryClientProvider } from "react-query";
import SmoothScroll from "./frontend/ScrollingAnimation/SmoothScroll";
import CheckYourEmail from "./frontend/Pages/ForgotPassword/CheckYourEmail";
import PasswordReset from "./frontend/Pages/ForgotPassword/PasswordReset";
import SetANewPassword from "./frontend/Pages/ForgotPassword/SetANewPassword";
import SuccessfulPage from "./frontend/Pages/ForgotPassword/SuccessfulPage";
import { ProtectedRoute } from "./backend/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <SmoothScroll>
      <QueryClientProvider client={queryClient}>
        <Routes>
          {/* Public Routes */}

          <Route path="/HomePage" element={<HomePage />} />
          <Route path="/ContactPage" element={<ContactPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="/SignUpPage" element={<SignUpPage />} />
          <Route path="/LogoutPage" element={<LogoutPage />} />
          <Route path="/*" element={<NotFoundPage />} />
          <Route path="/FreeSearchPage" element={<FreeSearchPage />} />
          <Route path="/privacypolicypage" element={<PrivacyPolicyPage />} />
          <Route path="/TOSPage" element={<TOSPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/checkyouremail" element={<CheckYourEmail />} />
          <Route path="/passwordreset" element={<PasswordReset />} />
          <Route path="/setpassword" element={<SetANewPassword />} />
          <Route path="/successful" element={<SuccessfulPage />} />

          {/* Protected Routes - Member */}
          <Route
            path="/profilepage"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/Searchpage" element={<SearchPage />} />
          <Route
            path="/SavedItemsAndSearches"
            element={
              <ProtectedRoute>
                <SavedItemsAndSearches />
              </ProtectedRoute>
            }
          />
        </Routes>
      </QueryClientProvider>
    </SmoothScroll>
  );
}

export default App;
