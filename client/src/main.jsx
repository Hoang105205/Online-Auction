import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ThemeInit } from "../.flowbite-react/init.js";
import { AuthProvider } from "./hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeInit />
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  </StrictMode>
);
