import { useState, useMemo, useEffect } from "react";
import ProductCard from "../../components/ProductCard";
import { HiTrash } from "react-icons/hi";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getWatchList } from "../../api/userService";
import { Spinner } from "flowbite-react";

const ITEMS_PER_PAGE = 3; // fallback only; server returns paginated results

export default function WatchlistPage() {
  const axiosPrivate = useAxiosPrivate();

  const [count, setCount] = useState(0);
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | price_desc | price_asc (server keys)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [products, setProducts] = useState([]); // API-mapped watchlist products
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Reset to page 1 when sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, [sortBy]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const result = await getWatchList(axiosPrivate, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: sortBy, // pass server-recognized sort keys directly
        });
        if (!isMounted) return;
        const mapped = (result.products || []).map((p) => ({
          id: p._id,
          name: p.detail?.name || "Sản phẩm",
          image: p.detail?.images && p.detail.images[0],
          currentPrice: p.auction?.currentPrice ?? 0,
          buyNowPrice: p.auction?.buyNowPrice ?? null,
          highestBidder: p.auction?.highestBidderId?.fullName || "",
          createdAt: p.createdAt,
          endDate: p.auction?.endTime,
          bidCount: p.auction?.bidders ?? 0,
          status: p.auction?.status || "active",
        }));
        setProducts(mapped);
        setCount(mapped.length);
        setTotalPages(result.pagination?.totalPages || 0);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Không thể tải danh sách theo dõi.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, currentPage, sortBy, reloadToken]);

  // Server already sorts and slices; render as-is to avoid double-processing
  const visibleProducts = products;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRemove = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    setCount(products.length);
  };

  return (
    <div className="p-6 md:p-8 relative">
      {isLoading && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
          aria-live="polite"
        >
          <Spinner size="lg" color="info" />
          <p className="mt-3 text-sm text-gray-700">
            Đang tải danh sách theo dõi...
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2">
              Lỗi tải danh sách
            </h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              type="button"
              onClick={() => setReloadToken(Date.now())}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Watch List của bạn
          </h2>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">Tổng cộng {count} sản phẩm</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="price_desc">Giá cao nhất</option>
                <option value="price_asc">Giá thấp nhất</option>
              </select>
            </div>
          </div>
        </div>
        {/* Product list or empty state */}
        {visibleProducts.length === 0 ? (
          <div className="w-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-xl bg-white">
            <div className="text-6xl mb-4 select-none">📥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có sản phẩm theo dõi
            </h3>
            <p className="text-gray-600 max-w-md mb-6 text-sm">
              Danh sách theo dõi của bạn đang trống. Hãy khám phá các phiên đấu
              giá và thêm sản phẩm để dễ dàng quản lý sau này.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-5 py-2.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium shadow-sm transition-colors"
            >
              Khám phá sản phẩm
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProducts.map((product) => (
                <div key={product.id} className="relative">
                  {/* Nút xóa */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute z-10 top-2 left-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
                    aria-label="Xóa khỏi theo dõi"
                  >
                    <HiTrash className="w-5 h-5 text-red-500" />
                  </button>
                  <ProductCard key={product.id} product={product} />
                </div>
              ))}
            </div>

            {/* Pagination (responsive, with ellipsis like RatingsTab) */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-gray-600 hidden md:block">
                    Trang {Math.min(currentPage, totalPages)} / {totalPages}
                  </div>

                  {/* Desktop pagination */}
                  <div className="hidden md:flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage <= 1}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage <= 1
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Trước
                    </button>
                    {(() => {
                      const buildPageList = (current, total) => {
                        if (total <= 7)
                          return Array.from({ length: total }, (_, i) => i + 1);
                        const pages = [];
                        pages.push(1);
                        const left = Math.max(2, current - 1);
                        const right = Math.min(total - 1, current + 1);
                        if (left > 2) pages.push("...");
                        for (let p = left; p <= right; p++) pages.push(p);
                        if (right < total - 1) pages.push("...");
                        pages.push(total);
                        return pages;
                      };
                      const pageList = buildPageList(currentPage, totalPages);
                      return pageList.map((p, idx) =>
                        p === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="px-3 py-2 text-sm text-gray-500"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                              currentPage === p
                                ? "bg-sky-50 text-sky-700 border-sky-200"
                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Sau
                    </button>
                  </div>

                  {/* Mobile pagination */}
                  <div className="flex md:hidden items-center gap-2">
                    <button
                      type="button"
                      aria-label="Trang trước"
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
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
                      <label
                        htmlFor="watchlist-page-select"
                        className="sr-only"
                      >
                        Chọn trang
                      </label>
                      <select
                        id="watchlist-page-select"
                        value={currentPage}
                        onChange={(e) =>
                          handlePageChange(Number(e.target.value))
                        }
                        className="border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                      >
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Trang {i + 1}/{totalPages}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      aria-label="Trang sau"
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className={`px-2 py-2 rounded-md border text-sm transition-colors ${
                        currentPage >= totalPages
                          ? "text-gray-400 border-gray-200 cursor-not-allowed"
                          : "text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
