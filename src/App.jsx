import { Route, Routes } from "react-router-dom";
import HomePage from "./frontend/Pages/HomePage";
import ContactPage from "./frontend/Pages/ContactPage";
import LoginPage from "./frontend/Pages/LoginPage";
import SignUpPage from "./frontend/Pages/SignUpPage";
import NotFoundPage from "./frontend/Pages/PageNotFound";
import ProfilePage from "./frontend/Pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/HomePage" element={<HomePage />} />
      <Route path="/ContactPage" element={<ContactPage />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/SignUpPage" element={<SignUpPage />} />
      {/* <Route path="/About" element={<About />} /> */}
      <Route path="/*" element={<NotFoundPage />} />
      <Route path="/profilepage" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
