import { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getParticipatingAuctions } from "../../api/userService";
import { Spinner } from "flowbite-react";

const ITEMS_PER_PAGE = 3; // server-sliced; used for passing to API

const AuctionsPage = () => {
  const axiosPrivate = useAxiosPrivate();
  const [filter, setFilter] = useState("all"); // all | active | ending_soon
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setIsLoading(true);
        const result = await getParticipatingAuctions(axiosPrivate, {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          filter: filter,
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
        setTotalPages(result.pagination?.totalPages || 0);
        setTotalItems(result.pagination?.totalItems || mapped.length);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Không thể tải danh sách đấu giá đã tham gia.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, currentPage, filter]);

  // Server returns page-sized items; render as-is
  const visibleProducts = products;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            Đang tải danh sách đấu giá...
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
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Đấu giá đang tham gia
          </h2>
          <p className="text-gray-600 mt-1">Tổng cộng {totalItems} sản phẩm</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang diễn ra" },
            { id: "ending_soon", label: "Sắp kết thúc" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === f.id
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {visibleProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Không có sản phẩm nào
          </h3>
          <p className="text-gray-600">
            Bạn chưa tham gia đấu giá nào hoặc không có sản phẩm phù hợp với bộ
            lọc.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
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
                  )}
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
                    <label htmlFor="auctions-page-select" className="sr-only">
                      Chọn trang
                    </label>
                    <select
                      id="auctions-page-select"
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
export default AuctionsPage;
