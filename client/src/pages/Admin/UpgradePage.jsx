import React, { useMemo, useState, useEffect } from "react";
import {
  HiSearch,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  listSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
} from "../../api/systemService";
import { toast } from "react-toastify";

export default function UpgradePage() {
  const [sortBy, setSortBy] = useState("asc");
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [acceptTarget, setAcceptTarget] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const pageSize = 6;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const [reloadToken, setReloadToken] = useState(0);

  // Fetch seller requests from API (server paginated)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await listSellerRequests(axiosPrivate, {
          page,
          limit: pageSize,
          sortBy,
        });
        if (!mounted) return;
        const items = (res.requests || []).map((r) => ({
          id: r.bidderId?._id || "",
          name: r.bidderId?.fullName || "Người dùng",
          dateStart: r.dateStart,
        }));
        setRequests(items);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.totalItems || items.length);
        setError(null);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Không thể tải danh sách yêu cầu.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [axiosPrivate, page, sortBy, reloadToken]);

  const paginated = requests; // server already slices

  function goto(p) {
    const pp = Math.max(1, Math.min(totalPages, p));
    setPage(pp);
  }

  function openAccept(id) {
    setAcceptTarget(id);
    setShowAcceptModal(true);
  }

  async function performAccept(id) {
    if (!id) return;
    try {
      const res = await approveSellerRequest(axiosPrivate, id);
      toast.success(res.message || "Phê duyệt yêu cầu thành công.");
      setShowAcceptModal(false);
      setReloadToken(Date.now());
    } catch (err) {
      toast.error(err.response?.data?.message || "Phê duyệt yêu cầu thất bại.");
    }
  }

  async function performReject(id) {
    if (!id) return;
    try {
      const res = await rejectSellerRequest(axiosPrivate, id);
      toast.success(res.message || "Từ chối yêu cầu thành công.");
      setReloadToken(Date.now());
    } catch (err) {
      toast.error(err.response?.data?.message || "Từ chối yêu cầu thất bại.");
    }
  }

  // Pagination list with ellipsis
  const pageList = useMemo(() => {
    const total = totalPages;
    const current = page;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push("...");
    pages.push(total);
    return pages;
  }, [page, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nâng cấp</h2>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg ring-1 ring-blue-100/60">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-full text-sm bg-white"
            >
              <option value="asc">Sắp xếp A-Z</option>
              <option value="desc">Sắp xếp Z-A</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="py-10 text-center text-gray-500">
            Đang tải yêu cầu...
          </div>
        )}

        {error && !isLoading && (
          <div className="py-6 text-center">
            <div className="inline-block px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded">
              {error}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px] md:min-w-0">
            <thead>
              <tr className="text-sm text-gray-500 border-b">
                <th className="py-4 px-4 whitespace-nowrap">ID</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4 whitespace-nowrap">Requested At</th>
                <th className="py-4 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((r, idx) => (
                <tr
                  key={`${r.id}-${idx}`}
                  className={`text-sm text-gray-600 ${
                    idx % 2 === 0 ? "" : "bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-4">{r.id}</td>
                  <td className="py-4 px-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-50 text-purple-600 font-semibold">
                      {(r.name || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.role}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {new Date(r.dateStart).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => openAccept(r.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 focus:ring-2 focus:ring-purple-300 text-white rounded-full text-sm transition-colors"
                      >
                        <HiCheck />
                        <span>Chấp nhận</span>
                      </button>
                      <button
                        onClick={() => performReject(r.id)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100 focus:ring-2 focus:ring-red-300 text-red-600 rounded-full text-sm transition-colors"
                      >
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Không có yêu cầu nâng cấp.
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
            Hiển thị {(page - 1) * pageSize + (paginated.length ? 1 : 0)} đến{" "}
            {(page - 1) * pageSize + paginated.length} trong tổng {totalItems}{" "}
            yêu cầu
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goto(page - 1)}
              className="p-2 rounded-full bg-gray-100"
              disabled={page === 1}
            >
              <HiChevronLeft />
            </button>
            {pageList.map((p, idx) =>
              p === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-sm text-gray-500"
                >
                  …
                </span>
              ) : (
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
              )
            )}
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
