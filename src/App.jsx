import { Route, Routes } from "react-router-dom";
import HomePage from "./frontend/Pages/HomePage";
import ContactPage from "./frontend/Pages/ContactPage";
import LoginPage from "./frontend/Pages/auth/LoginPage";
import SignUpPage from "./frontend/Pages/auth/SignUpPage";
import NotFoundPage from "./frontend/Pages/PageNotFound";
import ProfilePage from "./frontend/Pages/ProfilePage";
import PrivacyPolicyPage from "./frontend/Pages/PrivacyPolicyPage";
import ProfileHeader from "./frontend/Components/ProfileHeader";
import SearchPage from "./frontend/Pages/SearchPage";
import TOSPage from "./frontend/Pages/TOS-Page";
import FreeSearchPage from "./frontend/Pages/FreeSearchPage";
import { QueryClient, QueryClientProvider } from 'react-query';

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
    </Routes>
    </QueryClientProvider>

  );
}

export default App;
