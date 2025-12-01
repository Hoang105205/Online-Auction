"use client";

import React from "react";
import { NavLink } from "react-router-dom";
import {
  HiHome,
  HiOutlineViewGrid,
  HiCube,
  HiUsers,
  HiBadgeCheck,
  HiLibrary,
} from "react-icons/hi";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: HiHome },
  { to: "/admin/categories", label: "Danh mục", icon: HiOutlineViewGrid },
  { to: "/admin/products", label: "Sản phẩm", icon: HiCube },
  { to: "/admin/users", label: "Người dùng", icon: HiUsers },
  { to: "/admin/upgrade", label: "Nâng cấp", icon: HiBadgeCheck },
  { to: "/admin/settings", label: "Hệ thống", icon: HiLibrary },
];

export default function AdminSideBar({ mobileOpen = false, onClose }) {
  const desktopCls = "hidden md:block w-64";
  const mobileCls = `fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-200 bg-white border-r min-h-screen ${
    mobileOpen ? "translate-x-0" : "-translate-x-full"
  }`;

  return (
    <>
      <aside className={`${desktopCls} bg-white border-r min-h-screen`}>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <p className="font-bold text-lg">Auctify</p>
        </div>

        <nav className="mt-4">
          <ul className="flex flex-col">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.to} className="mb-1">
                  <NavLink
                    to={it.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-r-md mx-2 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-500 hover:text-blue-600"
                      }`
                    }
                  >
                    <Icon className="text-lg" />
                    <span>{it.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      <aside className={mobileCls} aria-hidden={!mobileOpen}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8" />
            <p className="font-bold text-lg">Auctify</p>
          </div>
          <button
            onClick={() => onClose && onClose()}
            aria-label="Close sidebar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="mt-4">
          <ul className="flex flex-col">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.to} className="mb-1">
                  <NavLink
                    to={it.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-r-md mx-2 ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-500 hover:text-blue-600"
                      }`
                    }
                  >
                    <Icon className="text-lg" />
                    <span>{it.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Backdrop when mobileOpen */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => onClose && onClose()}
        />
      )}
    </>
  );
}
