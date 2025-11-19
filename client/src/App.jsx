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

// Account related pages and layout
import AccountLayout from "./layouts/AccountLayout";
import ProfilePage from "./pages/account/ProfilePage";
import RatingPage from "./pages/account/RatingPage";
import AuctionsPage from "./pages/account/AuctionsPage";
import WinAuctionsPage from "./pages/account/WinAuctionsPage";
import WatchlistPage from "./pages/account/WatchlistPage";
import PermissionsPage from "./pages/account/PermissionsPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="details/:id" element={<DetailsPage />} />

        {/* Account pages */}
        <Route path="account" element={<AccountLayout />}>
          <Route index element={<ProfilePage />} />
          <Route path="rating" element={<RatingPage />} />
          <Route path="auctions" element={<AuctionsPage />} />
          <Route path="win-auctions" element={<WinAuctionsPage />} />
          <Route path="my-products" element={<WinAuctionsPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
        </Route>
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
