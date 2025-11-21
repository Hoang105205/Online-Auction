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
import MyProductsPage from "./pages/account/MyProductsPage";
import CreateProductPage from "./pages/account/CreateProductPage";

// Auth wrapper to protect routes
import RequireAuth from "./components/Auth/RequireAuth";
import PersistLogin from "./components/Auth/PersistLogin";

const ROLES = {
  Admin: 5150,
  Seller: 1984,
  Bidder: 2001,
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<PersistLogin />}>
        <Route path="/" element={<MainLayout />}>
          {/* 1. PUBLIC ROUTES (Truy cập tự do) */}
          <Route index element={<LandingPage />} />
          <Route path="details/:id" element={<DetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* 2. PROTECTED ROUTES (Yêu cầu Đã Đăng nhập) */}
          <Route element={<RequireAuth allowedRoles={[ROLES.Bidder]} />}>
            {/* Account pages */}
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="rating" element={<RatingPage />} />
              <Route path="auctions" element={<AuctionsPage />} />
              <Route path="win-auctions" element={<WinAuctionsPage />} />
              <Route path="my-products" element={<MyProductsPage />} />
              <Route
                path="my-products/create-product"
                element={<CreateProductPage />}
              />
              <Route path="watchlist" element={<WatchlistPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Yêu cầu Đã Đăng nhập với quyền Admin --> chưa config RequireAuth */}
        {/* Admin route */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </>
  )
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
