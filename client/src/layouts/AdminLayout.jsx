// client/src/layouts/AdminLayout.jsx

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSideBar from "../components/Admin/AdminSideBar";
import useAuth from "../hooks/useAuth";
import useRefreshToken from "../hooks/useRefreshToken";
import { HiLogout } from "react-icons/hi";

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex bg-gray-100 min-h-screen">
        <AdminSideBar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
            <button
              aria-label="Open sidebar"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-md bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <MobileAdminUser />
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            {/* Desktop admin user info (top-right) */}
            <DesktopAdminUser />

            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

function MobileAdminUser() {
  const { auth } = useAuth();
  const { logout } = useRefreshToken();

  const displayName = auth?.fullName || auth?.user?.fullName || "Admin";
  const displayEmail = auth?.email || auth?.user?.email || "";

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="font-semibold text-gray-800 text-xs leading-tight">
          {displayName}
        </p>
        {displayEmail && (
          <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
        )}
      </div>
      <button
        onClick={() => logout()}
        className="p-2 text-red-600 hover:bg-gray-200 rounded-md transition-colors"
        title="Đăng xuất"
      >
        <HiLogout className="text-lg" />
      </button>
    </div>
  );
}

function DesktopAdminUser() {
  const { auth } = useAuth();
  const { logout } = useRefreshToken();

  const displayName = auth?.fullName || auth?.user?.fullName || "Admin";
  const displayEmail = auth?.email || auth?.user?.email || "";

  return (
    <div className="hidden md:flex items-center justify-end mb-4">
      <div className="text-right leading-tight mr-3">
        <p className="font-semibold text-gray-800 text-sm md:text-base">
          {displayName}
        </p>
        {displayEmail && (
          <p className="text-xs md:text-sm text-gray-500">{displayEmail}</p>
        )}
      </div>
      <button
        onClick={() => logout()}
        className="px-3 py-2 bg-gray-400 rounded text-sm text-white hover:bg-gray-500 transition-colors flex items-center gap-1"
      >
        Đăng xuất
      </button>
    </div>
  );
}

export default AdminLayout;
