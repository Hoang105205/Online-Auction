import {
  Route,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import LandingPage from "./pages/LandingPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/Admin/DashboardPage";
import DetailsPage from "./pages/DetailsPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";
import AccountPage from "./pages/AccountPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="details/:id" element={<DetailsPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />

      {/* Admin route */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
