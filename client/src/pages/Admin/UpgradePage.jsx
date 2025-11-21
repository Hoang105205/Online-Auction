import React, { useMemo, useState } from "react";
import {
  HiSearch,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";

const MOCK_REQUESTS = [
  {
    id: "#ESF-2025-8742",
    name: "JasonDrake",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar1.jpg",
  },
  {
    id: "#ESF-2025-6391",
    name: "ElenaLiu",
    role: "Người đấu giá",
    avatar: "/auth-images/avatar2.jpg",
  },
  {
    id: "#ESF-2025-4129",
    name: "MarcusJohnson",
    role: "Người đấu giá",
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
    role: "Người đấu giá",
    avatar: "/auth-images/avatar6.jpg",
  },
];

export default function UpgradePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [acceptTarget, setAcceptTarget] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const pageSize = 6;

  const filtered = useMemo(() => {
    let data = requests.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (r) =>
          r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      );
    }
    if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  }, [query, sortBy, requests]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  function openAccept(id) {
    setAcceptTarget(id);
    setShowAcceptModal(true);
  }

  function performAccept(id) {
    if (!id) return;
    // In a real app we'd call an API to upgrade the user. For mock, remove from requests.
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setShowAcceptModal(false);
    setAcceptTarget("");
    const newTotal = Math.max(1, Math.ceil((filtered.length - 1) / pageSize));
    if (page > newTotal) setPage(newTotal);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nâng cấp</h2>
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

            <button className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded text-sm">
              {/* small control icon placeholder */}
              <span className="text-gray-400">☰</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px] md:min-w-0">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-4 px-4 whitespace-nowrap">ID</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Action</th>
                <th className="py-4 px-4 hidden sm:table-cell"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`text-sm text-gray-600 ${
                    idx % 2 === 0 ? "" : "bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-4">{r.id}</td>
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 font-semibold">
                      {r.name.split(" ")[0][0] || "U"}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.role}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => openAccept(r.id)}
                      className="w-full sm:inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full text-sm"
                    >
                      <HiCheck />
                      <span>Chấp nhận</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right hidden sm:table-cell">
                    &nbsp;
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No upgrade requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showAcceptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowAcceptModal(false)}
            />
            <div className="bg-white rounded-lg p-6 z-10 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2">Xác nhận nâng cấp</h3>
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc muốn nâng cấp người dùng "
                {requests.find((x) => x.id === acceptTarget)?.name ||
                  acceptTarget}
                " lên thành <strong>Người bán</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  onClick={() => performAccept(acceptTarget)}
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Chấp nhận
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-xs text-gray-400">
            Showing {(page - 1) * pageSize + (paginated.length ? 1 : 0)} to{" "}
            {(page - 1) * pageSize + paginated.length} of {requests.length}{" "}
            requests
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
