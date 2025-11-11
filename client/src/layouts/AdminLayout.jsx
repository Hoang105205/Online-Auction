// client/src/layouts/AdminLayout.jsx (Mã mẫu)

import React from "react";
import { Outlet } from "react-router-dom";
import AdminSideBar from "../components/Admin/AdminSideBar";

const AdminLayout = () => {
  return (
    <>
      <div className="flex bg-gray-100 min-h-screen">
        <AdminSideBar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;
