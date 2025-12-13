import { useState, useEffect } from "react";
import WonProductCard from "../../components/Account/WonProductCard";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Spinner } from "flowbite-react";
import { getSoldProducts } from "../../api/userService";

const ITEMS_PER_PAGE = 3; // server paginates; keep as default

const MySoldProductsPage = () => {
  const axiosPrivate = useAxiosPrivate();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const result = await getSoldProducts(axiosPrivate, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });
        if (!isMounted) return;
        const mapped = (result.products || []).map((p) => ({
          id: p._id,
          name: p.detail?.name || "Sản phẩm",
          image: p.detail?.images && p.detail.images[0],
          currentPrice: p.auction?.currentPrice ?? 0,
          status: p.auction?.status || "pending", // pending | ended | cancelled
          bidCount: p.auction?.bidders ?? 0,
          updatedAt: p.updatedAt,
          winnerName: p.auction?.highestBidderId?.fullName || "—",
          winnerRating:
            typeof p.auction?.highestBidderId?.rating === "number"
              ? p.auction.highestBidderId.rating
              : undefined,
        }));
        setProducts(mapped);
        setCount(result.pagination?.totalItems || mapped.length);
        setTotalPages(result.pagination?.totalPages || 0);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Không thể tải danh sách sản phẩm đã bán.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, currentPage, reloadToken]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
            Đang tải sản phẩm đã bán...
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

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sản phẩm đã bán - đã kết thúc
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-1">
              Tổng số sản phẩm
            </p>
            <p className="text-3xl font-bold text-green-600">{count}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium mb-1">
              Cập nhật gần nhất
            </p>
            <p className="text-lg font-bold text-purple-600">
              {products.length > 0
                ? new Date(
                    Math.max(...products.map((a) => new Date(a.updatedAt)))
                  ).toLocaleDateString("vi-VN")
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">Tổng cộng {count} sản phẩm</p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm đã bán
          </h3>
          <p className="text-gray-600">
            Hiện chưa có sản phẩm nào của bạn đã kết thúc.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <WonProductCard
                key={product.id}
                product={product}
                role="seller"
              />
            ))}
          </div>

          {/* Pagination (responsive, with ellipsis like WinAuctions) */}
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
                    <label htmlFor="sold-page-select" className="sr-only">
                      Chọn trang
                    </label>
                    <select
                      id="sold-page-select"
                      value={currentPage}
                      onChange={(e) => handlePageChange(Number(e.target.value))}
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
  );
};
export default MySoldProductsPage;
