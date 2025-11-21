import { useState, useMemo } from "react";
import ProductCard from "../../components/ProductCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

// Mock data for auctions user has won
const MOCK_WON_AUCTIONS = [
  {
    id: 101,
    name: "Samsung Galaxy S24 Ultra 512GB",
    image: "/img/image1.jpg",
    currentPrice: 26000000,
    postedDate: "2025-10-20",
    endDate: "2025-11-05",
    wonDate: "2025-11-05",
  },
  {
    id: 102,
    name: "Bàn phím cơ Keychron K8 Pro",
    image: "/img/image2.jpg",
    currentPrice: 2800000,
    postedDate: "2025-10-15",
    endDate: "2025-11-01",
    wonDate: "2025-11-01",
  },
  {
    id: 103,
    name: "Tai nghe Sony WH-1000XM5 Noise Cancelling",
    image: "/img/image3.jpg",
    currentPrice: 7500000,
    postedDate: "2025-10-10",
    endDate: "2025-10-28",
    wonDate: "2025-10-28",
  },
  {
    id: 104,
    name: "Apple Watch Series 9 GPS 45mm",
    image: "/img/image4.jpg",
    currentPrice: 9800000,
    postedDate: "2025-10-05",
    endDate: "2025-10-25",
    wonDate: "2025-10-25",
  },
  {
    id: 105,
    name: "Máy ảnh Fujifilm X-T5 Body",
    image: "/img/image5.jpg",
    currentPrice: 38000000,
    postedDate: "2025-09-28",
    endDate: "2025-10-20",
    wonDate: "2025-10-20",
  },
];

const ITEMS_PER_PAGE = 3;

const WinAuctionsPage = () => {
  const [sortBy, setSortBy] = useState("recent"); // recent | oldest | price-high | price-low
  const [currentPage, setCurrentPage] = useState(1);

  const sortedAuctions = useMemo(() => {
    const sorted = [...MOCK_WON_AUCTIONS];

    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => new Date(b.wonDate) - new Date(a.wonDate));
      case "oldest":
        return sorted.sort((a, b) => new Date(a.wonDate) - new Date(b.wonDate));
      case "price-high":
        return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
      case "price-low":
        return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
      default:
        return sorted;
    }
  }, [sortBy]);

  // Reset to page 1 when sort changes
  useMemo(() => {
    setCurrentPage(1);
  }, [sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedAuctions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAuctions = sortedAuctions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate total value
  const totalValue = MOCK_WON_AUCTIONS.reduce(
    (sum, auction) => sum + auction.currentPrice,
    0
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header with Stats */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Đấu giá đã thắng
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium mb-1">
              Tổng số đấu giá thắng
            </p>
            <p className="text-3xl font-bold text-green-600">
              {MOCK_WON_AUCTIONS.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">
              Tổng giá trị
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatPrice(totalValue)}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-700 font-medium mb-1">
              Đấu giá gần nhất
            </p>
            <p className="text-lg font-bold text-purple-600">
              {new Date(
                Math.max(...MOCK_WON_AUCTIONS.map((a) => new Date(a.wonDate)))
              ).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-gray-600">
            Hiển thị {sortedAuctions.length} sản phẩm
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price-high">Giá cao nhất</option>
              <option value="price-low">Giá thấp nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedAuctions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có đấu giá nào thắng
          </h3>
          <p className="text-gray-600">
            Bạn chưa thắng đấu giá nào. Hãy tham gia đấu giá để có cơ hội thắng!
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentAuctions.map((auction) => (
              <ProductCard key={auction.id} product={auction} isWon={true} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Trang trước"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] h-10 px-3 rounded-lg border font-medium transition-colors ${
                      currentPage === page
                        ? "bg-sky-600 text-white border-sky-600"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border transition-colors ${
                  currentPage === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                aria-label="Trang sau"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default WinAuctionsPage;
