import { Route, Routes } from "react-router-dom";
import HomePage from "./frontend/Pages/StaticPages/HomePage";
import ContactPage from "./frontend/Pages/StaticPages/ContactPage";
import LoginPage from "./frontend/Pages/AuthPages/LoginPage";
import SignUpPage from "./frontend/Pages/AuthPages/SignUpPage";
import NotFoundPage from "./frontend/Pages/StaticPages/PageNotFound";
import ProfilePage from "./frontend/Pages/UserPages/ProfilePage";
import PrivacyPolicyPage from "./frontend/Pages/StaticPages/PrivacyPolicyPage";
import ProfileHeader from "./frontend/Components/Headers/SavedSearchHeader";
import SearchPage from "./frontend/Pages/SearchPages/SearchPage";
import TOSPage from "./frontend/Pages/StaticPages/TOS-Page";
import FreeSearchPage from "./frontend/Pages/SearchPages/FreeSearchPage";
import SavedItemsAndSearches from "./frontend/Pages/UserPages/SavedSearchItemPage";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
        {/* <Route path="/About" element={<About />} /> */}
        <Route path="/*" element={<NotFoundPage />} />
        <Route path="/profilepage" element={<ProfilePage />} />
        <Route path="/privacypolicypage" element={<PrivacyPolicyPage />} />
        <Route path="/userheader" element={<ProfileHeader />} />

        <Route path="/Searchpage" element={<SearchPage />} />

        <Route path="/TOSPage" element={<TOSPage />} />
        <Route path="/FreeSearchPage" element={<FreeSearchPage />} />
        <Route
          path="/SavedItemsAndSearches"
          element={<SavedItemsAndSearches />}
        />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
