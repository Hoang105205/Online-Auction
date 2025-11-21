import React, { useMemo, useState } from "react";
import {
  HiSearch,
  HiPencilAlt,
  HiTrash,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const MOCK_USERS = [
  {
    id: "#ESF-2025-8742",
    name: "JasonDrake",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar1.jpg",
  },
  {
    id: "#ESF-2025-6391",
    name: "ElenaLiu",
    role: "Người bán",
    avatar: "/auth-images/avatar2.jpg",
  },
  {
    id: "#ESF-2025-4129",
    name: "MarcusJohnson",
    role: "Người bán",
    avatar: "/auth-images/avatar3.jpg",
  },
  {
    id: "#ESF-2025-2875",
    name: "SophiaNguyen",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar4.jpg",
  },
  {
    id: "#ESF-2025-1493",
    name: "RyanKim",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar5.jpg",
  },
  {
    id: "#ESF-2025-0967",
    name: "AmeliaMartinez",
    role: "Người bán",
    avatar: "/auth-images/avatar6.jpg",
  },
  {
    id: "#ESF-2025-2234",
    name: "LiamSmith",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar7.jpg",
  },
  {
    id: "#ESF-2025-3345",
    name: "OliviaBrown",
    role: "Người bán",
    avatar: "/auth-images/avatar8.jpg",
  },
];

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(MOCK_USERS);
  const [openRows, setOpenRows] = useState(new Set());
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [deleteTarget, setDeleteTarget] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let data = users.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [query, sortBy, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  function toggleRow(id) {
    const s = new Set(openRows);
    if (s.has(id)) s.delete(id);
    else s.add(id);
    setOpenRows(s);
  }

  function startEdit(id) {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setEditingId(id);
    setEditName(u.name);
    setEditRole(u.role);
  }

  function submitEdit() {
    if (!editingId) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingId ? { ...u, name: editName.trim(), role: editRole } : u
      )
    );
    setEditingId("");
    setEditName("");
    setEditRole("");
  }

  function cancelEdit() {
    setEditingId("");
    setEditName("");
    setEditRole("");
  }

  function handleDeleteClick(id) {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  }

  function performDelete(id) {
    if (!id) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setShowDeleteModal(false);
    setDeleteTarget("");
    const newTotal = Math.max(1, Math.ceil((filtered.length - 1) / pageSize));
    if (page > newTotal) setPage(newTotal);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Người dùng</h2>
        <div className="flex items-center gap-3">
          <button className="px-3 py-2 bg-white border rounded">Export</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-blue-100/60">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative max-w-xl">
              <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search player..."
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-full text-sm bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Add user button removed per request */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-4 px-4">ID</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Quyền</th>
                <th className="py-4 px-4">Actions</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u, idx) => (
                <React.Fragment key={u.id}>
                  <tr
                    className={`text-sm text-gray-600 ${
                      idx % 2 === 0 ? "" : "bg-gray-50"
                    }`}
                  >
                    <td className="py-4 px-4">{u.id}</td>

                    {editingId === u.id ? (
                      <>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt="av"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 border rounded"
                          />
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 border rounded"
                          >
                            <option>Người đấu giá</option>
                            <option>Người bán</option>
                            <option>Admin</option>
                          </select>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={submitEdit}
                              className="px-3 py-1 bg-green-600 text-white rounded"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-100 rounded"
                            >
                              Hủy
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 font-semibold">
                            {u.name.split(" ")[0][0] || "U"}
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-gray-400">{u.id}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{u.role}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(u.id)}
                              className="p-2 rounded-full bg-purple-50 text-purple-600"
                            >
                              <HiPencilAlt />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(u.id)}
                              className="p-2 rounded-full bg-red-50 text-red-500"
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}

                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toggleRow(u.id)}
                        className={`p-1 rounded ${
                          openRows.has(u.id) ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <HiChevronDown
                          className={`${
                            openRows.has(u.id) ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>
                  </tr>

                  {openRows.has(u.id) && (
                    <tr className="text-sm text-gray-600 bg-gray-50">
                      <td className="py-3 px-4">&nbsp;</td>
                      <td colSpan={3} className="py-3 px-4">
                        <div className="text-sm text-gray-500">
                          Thông tin thêm: email@example.com • Đã đăng ký:
                          01/01/2024
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">&nbsp;</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDeleteModal(false)}
            />
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc muốn xóa người dùng "
                {users.find((x) => x.id === deleteTarget)?.name || deleteTarget}
                "? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={() => performDelete(deleteTarget)}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + (paginated.length ? 1 : 0)} to{" "}
            {(page - 1) * pageSize + paginated.length} of {users.length} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goto(page - 1)}
              className="p-2 rounded-full bg-gray-100"
              disabled={page === 1}
            >
              <HiChevronLeft />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => goto(p)}
                  className={`w-8 h-8 rounded-full text-sm ${
                    p === page
                      ? "bg-purple-600 text-white"
                      : "bg-white border text-gray-600"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => goto(page + 1)}
              className="p-2 rounded-full bg-gray-100"
              disabled={page === totalPages}
            >
              <HiChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
