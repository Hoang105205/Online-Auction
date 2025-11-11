"use client";

import {
  Sidebar,
  SidebarItem,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import {
  HiHome,
  HiOutlineViewGrid,
  HiCube,
  HiUsers,
  HiBadgeCheck,
  HiLibrary,
} from "react-icons/hi";
import { NavLink } from "react-router-dom";

export default function AdminSideBar() {
  return (
    <Sidebar aria-label="Admin Dashboard Sidebar" className="h-screen">
      {/* Header / Logo */}
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        <p className="font-bold text-lg">Auctify</p>
      </div>

      {/* Menu items */}
      <SidebarItems>
        <SidebarItemGroup>
          <SidebarItem
            as={NavLink}
            to="/admin"
            icon={HiHome}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Dashboard
          </SidebarItem>

          <SidebarItem
            as={NavLink}
            to="/admin/categories"
            icon={HiOutlineViewGrid}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Danh mục
          </SidebarItem>

          <SidebarItem
            as={NavLink}
            to="/admin/products"
            icon={HiCube}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Sản phẩm
          </SidebarItem>

          <SidebarItem
            as={NavLink}
            to="/admin/users"
            icon={HiUsers}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Người dùng
          </SidebarItem>

          <SidebarItem
            as={NavLink}
            to="/admin/upgrade"
            icon={HiBadgeCheck}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Nâng cấp
          </SidebarItem>

          <SidebarItem
            as={NavLink}
            to="/admin/settings"
            icon={HiLibrary}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 font-semibold"
                : "text-gray-500 hover:text-blue-500"
            }
          >
            Hệ thống
          </SidebarItem>
        </SidebarItemGroup>
      </SidebarItems>
    </Sidebar>
  );
}
