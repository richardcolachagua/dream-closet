import React from "react";
import ReactDOM from "react-dom/client";
import "./app/index.css";
import App from "./app/App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>,
);
