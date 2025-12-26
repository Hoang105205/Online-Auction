import React, { useMemo, useState, useEffect } from "react";
import {
  HiSearch,
  HiTrash,
  HiChevronDown,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { toast } from "react-toastify";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import systemService, { removeUser } from "../../api/systemService";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [openRows, setOpenRows] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const pageSize = 6;
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const [totalCount, setTotalCount] = useState(0);

  const ROLE_LABEL = (r) => {
    if (r === undefined || r === null) return "";
    // accept number or numeric string or role name
    const n = Number(r);
    if (!Number.isNaN(n)) {
      switch (n) {
        case 5150:
          return "Admin";
        case 1984:
          return "Người bán";
        case 2001:
          return "Người đấu giá";
        default:
          return String(r);
      }
    }
    const s = String(r).toLowerCase();
    if (s === "admin") return "Admin";
    if (s === "seller" || s === "người bán") return "Người bán";
    if (s === "bidder" || s === "người đấu giá") return "Người đấu giá";
    return String(r);
  };

  // server-side pagination/search
  // We sort the current page items client-side based on sortBy
  const paginated = useMemo(() => {
    const data = (users || []).slice();
    if (sortBy === "name") {
      data.sort((a, b) => {
        const an = a.fullName || a.email || "";
        const bn = b.fullName || b.email || "";
        return String(an).localeCompare(String(bn), "vi", {
          sensitivity: "base",
        });
      });
    } else {
      // date (default): show newest first
      data.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
    }
    return data;
  }, [users, sortBy]);

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await systemService.listUsers(axiosPrivate, {
          page,
          limit: pageSize,
          q: query,
          sortBy,
        });
        if (!isMounted) return;
        setUsers(res.data || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(
          typeof res.total === "number" ? res.total : (res.data || []).length
        );
      } catch (err) {
        console.error("Fetch users failed", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [page, query]);

  function toggleRow(id) {
    const key = id;
    const s = new Set(openRows);
    if (s.has(key)) s.delete(key);
    else s.add(key);
    setOpenRows(s);
  }

  function handleDeleteClick(id) {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  }

  function performDelete(id) {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        await removeUser(axiosPrivate, id);
        // on success, remove from UI
        setUsers((prev) => {
          const next = prev.filter((u) => (u._id || u.id) !== id);
          setTotalCount((c) => Math.max(0, c - 1));
          const newTotal = Math.max(1, Math.ceil(next.length / pageSize));
          if (page > newTotal) setPage(newTotal);
          return next;
        });
        toast.success("Xóa người dùng thành công");
      } catch (err) {
        console.error("Delete user failed", err);
        toast.error(err.response?.data?.message || "Xóa người dùng thất bại");
      } finally {
        setShowDeleteModal(false);
        setDeleteTarget("");
        setLoading(false);
      }
    })();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Người dùng</h2>
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
                placeholder="Tìm kiếm người dùng..."
                className="w-full pl-10 pr-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : (
                paginated.map((u, idx) => (
                  <React.Fragment key={u._id || u.id}>
                    <tr
                      className={`text-sm text-gray-600 ${
                        idx % 2 === 0 ? "" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-4 px-4">{u._id || u.id}</td>

                      <td className="py-4 px-4 flex items-center gap-3">
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {u.fullName || u.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {Array.isArray(u.roles)
                          ? u.roles.map((r) => ROLE_LABEL(r)).join(", ")
                          : ROLE_LABEL(u.role) || ""}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteClick(u._id || u.id)}
                            className="p-2 rounded-full bg-red-50 text-red-500"
                          >
                            <HiTrash />
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => toggleRow(u._id || u.id)}
                          className={`p-1 rounded ${
                            openRows.has(u._id || u.id)
                              ? "bg-gray-100"
                              : "bg-white"
                          }`}
                        >
                          <HiChevronDown
                            className={`${
                              openRows.has(u._id || u.id)
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {openRows.has(u._id || u.id) && (
                      <tr className="text-sm text-gray-600 bg-gray-50">
                        <td className="py-3 px-4">&nbsp;</td>
                        <td colSpan={3} className="py-3 px-4">
                          <div className="text-sm text-gray-700 space-y-2">
                            <div>
                              <span className="font-semibold text-gray-600">
                                Email:
                              </span>{" "}
                              {u.email}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">
                                Địa chỉ:
                              </span>{" "}
                              {u.address || "Chưa cập nhật"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Đã đăng ký:{" "}
                              {new Date(u.createdAt).toLocaleDateString(
                                "vi-VN"
                              ) || "01/01/2024"}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">&nbsp;</td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}

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
                {users.find((x) => (x._id || x.id) === deleteTarget)
                  ?.fullName || deleteTarget}
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
            {(page - 1) * pageSize + paginated.length} of {totalCount} users
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
