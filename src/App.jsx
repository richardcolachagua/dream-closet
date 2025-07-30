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

          {/* Protected Routes - Member */}
          <Route path="/profilepage" element={<ProfilePage />} />
          <Route path="/Searchpage" element={<SearchPage />} />
          <Route
            path="/SavedItemsAndSearches"
            element={<SavedItemsAndSearches />}
          />
        </Routes>
      </QueryClientProvider>
    </SmoothScroll>
  );
}

export default App;
