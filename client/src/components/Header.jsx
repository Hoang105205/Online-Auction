import {
  Button,
  MegaMenu,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";

const Header = () => {
  const { auth, setAuth } = useAuth();
  const { logout } = useRefreshToken();

  const navigate = useNavigate();
  // Determine logged-in state (adjust key names to match your auth shape)
  const isLoggedIn = Boolean(auth?.email || auth?.user?.email);
  const displayName = auth?.fullName || auth?.user?.fullName || "Người dùng";
  const displayEmail = auth?.email || auth?.user?.email || "";

  const handleLogout = async () => {
    await logout();
  };
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);

  // Close mobile menu when navigating (basic approach)
  const handleNavClick = () => setMobileOpen(false);

  return (
    <div className="border-b border-black/20 bg-white">
      <MegaMenu>
        <Link to="/" className="flex items-center" onClick={handleNavClick}>
          <img alt="" src="/logo.png" className="mr-3 h-8 sm:h-12" />
          <span className="self-center whitespace-nowrap text-lg md:text-3xl font-semibold dark:text-white">
            Auctify
          </span>
        </Link>

        {/* Mobile auth actions when NOT logged in */}
        {!isLoggedIn && (
          <div className="md:hidden ml-auto flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-800 rounded-lg border border-gray-300 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Đăng nhập
            </Link>
            <Button
              onClick={() => navigate("/signup")}
              size="sm"
              className="bg-sky-600 hover:bg-sky-700"
            >
              Đăng ký
            </Button>
          </div>
        )}

        {/* Desktop Right side controls */}
        <div className="order-2 hidden items-center md:flex">
          {!isLoggedIn ? (
            <>
              <Link
                to="/login"
                className="md:text-xl mr-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 md:mr-2 md:px-5 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Đăng nhập
              </Link>
              <Button
                onClick={() => navigate("/signup")}
                className="md:text-xl bg-sky-600 hover:bg-sky-700"
              >
                Đăng ký
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="text-right leading-tight">
                <p className="font-semibold text-gray-800 text-sm md:text-base">
                  {displayName}
                </p>
                <p className="text-xs md:text-sm text-gray-500">
                  {displayEmail}
                </p>
              </div>
              <Button color="gray" size="sm" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </div>
          )}
        </div>

        {/* Custom Mobile Hamburger (only when logged in) */}
        {isLoggedIn && (
          <button
            type="button"
            aria-label="Mở menu điều hướng"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={toggleMobile}
            className="md:hidden ml-auto inline-flex items-center justify-center p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                  mobileOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-current transition duration-300 ease-in-out ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
                  mobileOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </div>
          </button>
        )}

        {/* Desktop collapse (retain Flowbite for layout) */}
        {isLoggedIn && (
          <NavbarCollapse className="hidden md:flex">
            <Link
              to="/"
              onClick={handleNavClick}
              className="md:text-sm lg:text-base py-2 px-3 hover:text-sky-600"
            >
              Trang chủ
            </Link>
            <Link
              to="/account"
              onClick={handleNavClick}
              className="md:text-sm lg:text-base py-2 px-3 hover:text-sky-600"
            >
              Tài khoản của tôi
            </Link>
            <Link
              to="/account/auctions"
              onClick={handleNavClick}
              className="md:text-sm lg:text-base py-2 px-3 hover:text-sky-600"
            >
              Sản phẩm đang đấu giá
            </Link>
            <Link
              to="/account/win-auctions"
              onClick={handleNavClick}
              className="md:text-sm lg:text-base py-2 px-3 hover:text-sky-600"
            >
              Sản phẩm thắng
            </Link>
          </NavbarCollapse>
        )}
      </MegaMenu>

      {/* Mobile menu panel */}
      {isLoggedIn && (
        <div
          id="mobile-nav"
          className={`md:hidden ${
            mobileOpen ? "block" : "hidden"
          } border-t border-gray-200 bg-white shadow-sm`}
        >
          <div className="px-5 py-3 border-b border-gray-200 bg-white/80 backdrop-blur">
            <p className="font-semibold text-gray-800 text-base">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 break-all">
              {displayEmail}
            </p>
          </div>
          <nav className="flex flex-col py-4">
            <Link
              to="/"
              onClick={handleNavClick}
              className="px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Trang chủ
            </Link>
            <Link
              to="/account"
              onClick={handleNavClick}
              className="px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Tài khoản của tôi
            </Link>
            <Link
              to="/account/auctions"
              onClick={handleNavClick}
              className="px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Sản phẩm đang đấu giá
            </Link>
            <Link
              to="/account/win-auctions"
              onClick={handleNavClick}
              className="px-5 py-2 text-gray-700 hover:bg-gray-50"
            >
              Sản phẩm thắng
            </Link>
            <button
              onClick={() => {
                handleLogout();
                handleNavClick();
              }}
              className="text-left px-5 py-2 text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};
export default Header;
