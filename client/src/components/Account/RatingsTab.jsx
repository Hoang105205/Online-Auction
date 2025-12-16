import { useEffect, useMemo, useState } from "react";
import { HiThumbUp, HiThumbDown } from "react-icons/hi";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getUserFeedback } from "../../api/userService";

import { Spinner } from "flowbite-react";

export default function RatingsTab() {
  const PER_PAGE = 5;

  const [filter, setFilter] = useState("all"); // all | bidder | seller
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]); // raw API feedbacks
  const [stats, setStats] = useState({
    total: 0,
    good: 0,
    bad: 0,
    percentage: 100,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0); // force re-fetch trigger

  const axiosPrivate = useAxiosPrivate();

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const data = await getUserFeedback(
          axiosPrivate,
          currentPage,
          filter,
          PER_PAGE
        );
        if (!isMounted) return;
        setFeedbacks(data.feedbacks || []);
        setStats(data.stats || { total: 0, good: 0, bad: 0, percentage: 100 });
        setTotalPages(data.pagination.totalPages || 0);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Đã có lỗi xảy ra khi tải đánh giá.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, currentPage, filter, reloadToken]);

  const handleRetry = () => {
    setError(null);
    setReloadToken(Date.now());
  };

  // Transform API feedbacks into rendering format
  const displayFeedbacks = useMemo(
    () =>
      feedbacks.map((fb) => ({
        id: fb._id,
        reviewer: fb.commenter,
        role: fb.role, // same as filter context
        type: fb.isGood ? "up" : "down",
        comment: fb.content,
        date: fb.date,
      })),
    [feedbacks]
  );

  const effectiveTotalPages = useMemo(() => {
    // Use server pagination total; fallback to calculated if server returns 0
    if (totalPages && totalPages > 0) return totalPages;
    const derived = Math.ceil(displayFeedbacks.length / PER_PAGE);
    return derived > 0 ? derived : 1;
  }, [totalPages, displayFeedbacks.length]);

  const paged = useMemo(() => {
    // Server already paginates and returns totalPages -> use as-is
    if (totalPages && totalPages > 0) return displayFeedbacks;
    // Fallback: paginate on client when totalPages not provided
    const start = (currentPage - 1) * PER_PAGE;
    return displayFeedbacks.slice(start, start + PER_PAGE);
  }, [displayFeedbacks, currentPage, totalPages]);

  const buildPageList = (current, total) => {
    const pages = [];
    // Show all pages only when very small (<=4)
    if (total <= 4) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }
    const first = 1;
    const last = total;

    // Near the beginning: 1,2,3,...,last
    if (current <= 3) {
      pages.push(1, 2, 3, "...", last);
      return pages;
    }

    // Near the end: 1,...,last-2,last-1,last
    if (current >= total - 2) {
      pages.push(first, "...", total - 2, total - 1, last);
      return pages;
    }

    // Middle: 1,...,current-1,current,current+1,...,last
    pages.push(first, "...", current - 1, current, current + 1, "...", last);
    return pages;
  };
  const pageList = useMemo(
    () => buildPageList(currentPage, effectiveTotalPages),
    [currentPage, effectiveTotalPages]
  );

  // Derive ups & downs from API stats for display (percentage already provided)
  const derivedStats = useMemo(() => {
    const ups = stats.good;
    const downs = stats.bad;
    const total = stats.total;
    const avg = total ? ups / total : 0;
    return { ups, downs, total, avg, percentage: stats.percentage };
  }, [stats]);

  return (
    <div className="relative">
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
          aria-live="polite"
        >
          <Spinner size="lg" color="info" />
          <p className="mt-3 text-sm text-gray-700">Đang tải đánh giá...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Lỗi tải đánh giá
            </h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className="p-6 md:p-8" aria-live="polite">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left column: Average score (approx 25%) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Điểm đánh giá trung bình
                </h2>
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-extrabold text-sky-600">
                    {derivedStats.total === 0
                      ? 100
                      : Math.round(derivedStats.avg * 100)}
                    %
                  </span>
                  <span className="text-gray-500 mb-1">
                    ({derivedStats.ups}/{derivedStats.total})
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-sky-500"
                    style={{ width: `${derivedStats.avg * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-1 md:gap-2">
                    <HiThumbUp className="text-green-600 text-base md:text-xl lg:text-2xl" />
                    <span className="md:text-xl font-bold">
                      {derivedStats.ups}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <HiThumbDown className="text-red-600 text-base md:text-xl lg:text-2xl" />
                    <span className="md:text-xl font-bold">
                      {derivedStats.downs}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Reviews list with filters */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border">
                {/* Filter bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Đánh giá chi tiết
                    <span className="block md:hidden font-semibold">
                      Với vai trò:
                    </span>
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="hidden md:block font-semibold">
                      Với vai trò:{" "}
                    </span>
                    {[
                      { id: "all", label: "Tất cả" },
                      { id: "bidder", label: "Là người mua" },
                      { id: "seller", label: "Là người bán" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilter(f.id)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          filter === f.id
                            ? "bg-sky-50 text-sky-700 border-sky-200"
                            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List */}
                <div className="divide-y">
                  {displayFeedbacks.length === 0 ? (
                    <div className="p-6 text-gray-500">
                      Chưa có đánh giá nào.
                    </div>
                  ) : (
                    paged.map((r) => (
                      <div key={r.id} className="p-4 flex gap-3 items-start">
                        {/* Icon / status */}
                        <div
                          className={`mt-1 inline-flex items-center justify-center h-8 w-8 rounded-full ${
                            r.type === "up" ? "bg-green-100" : "bg-red-100"
                          }`}
                        >
                          {r.type === "up" ? (
                            <HiThumbUp className="text-green-600" />
                          ) : (
                            <HiThumbDown className="text-red-600" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {r.reviewer}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${
                                r.role === "bidder"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {r.role === "bidder"
                                ? "là người mua"
                                : "là người bán"}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(r.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mt-1 break-words">
                            {r.comment}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
                  {/* Left: page text (hidden on mobile, shown on md+) */}
                  <div className="text-sm text-gray-600 hidden md:block">
                    Trang {Math.min(currentPage, effectiveTotalPages)} /{" "}
                    {effectiveTotalPages}
                  </div>

                  {/* Desktop pagination (md and up): full numeric with ellipsis */}
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Trước
                    </button>
                    {pageList.map((p, idx) =>
                      p === "..." ? (
                        <span
                          key={`e-${idx}`}
                          className="px-3 py-2 text-gray-500 select-none"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                            currentPage === p
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(effectiveTotalPages, p + 1)
                        )
                      }
                      disabled={currentPage >= effectiveTotalPages}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= effectiveTotalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Sau
                    </button>
                  </div>

                  {/* Mobile pagination (below md): compact controls */}
                  <div className="flex md:hidden items-center gap-2">
                    <button
                      type="button"
                      aria-label="Trang trước"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className={`px-2 py-2 rounded-md border text-sm transition-colors ${
                        currentPage <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Trước
                    </button>
                    <div className="flex items-center gap-2">
                      <label htmlFor="page-select" className="sr-only">
                        Chọn trang
                      </label>
                      <select
                        id="page-select"
                        value={currentPage}
                        onChange={(e) => setCurrentPage(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                      >
                        {Array.from({ length: effectiveTotalPages }).map(
                          (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              Trang {i + 1}/{effectiveTotalPages}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <button
                      type="button"
                      aria-label="Trang sau"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(effectiveTotalPages, p + 1)
                        )
                      }
                      disabled={currentPage >= effectiveTotalPages}
                      className={`px-2 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= effectiveTotalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
