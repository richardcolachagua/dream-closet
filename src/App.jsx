import { Route, Routes } from "react-router-dom";
import HomePage from "./frontend/Pages/HomePage";
import ContactPage from "./frontend/Pages/ContactPage";
import LoginPage from "./frontend/Pages/LoginPage";
import SignUpPage from "./frontend/Pages/SignUpPage";
import About from "./frontend/Pages/About";
import { Box } from "@mui/material";

function App() {
  return (
    <Box sx={{ backgroundColor: "#000", height: "100vh" }}>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/SignUpPage" element={<SignUpPage />} />
        <Route path="/About" element={<About />} />
      </Routes>
    </Box>
  );
}

export default App;
