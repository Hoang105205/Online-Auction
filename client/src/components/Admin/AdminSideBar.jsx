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

export default function AdminSideBar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen">
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
  );
}
