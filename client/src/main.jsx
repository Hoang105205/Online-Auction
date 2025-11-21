import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ThemeInit } from "../.flowbite-react/init.js";
import { AuthProvider } from "./hooks/useAuth";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeInit />
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
