import { useState, useMemo } from "react";
import ProductCard from "../../components/ProductCard";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

// Mock data for auctions user is participating in
const MOCK_AUCTIONS = [
  {
    id: 1,
    name: "Vintage Camera Canon AE-1 Program",
    image: "/img/image1.jpg",
    currentPrice: 2500000,
    buyNowPrice: 3500000,
    highestBidder: "NguyenVanA",
    postedDate: "2025-11-10",
    endDate: "2025-11-25",
    bidCount: 15,
  },
  {
    id: 2,
    name: "MacBook Pro 2023 M3 Chip 16GB RAM",
    image: "/img/image2.jpg",
    currentPrice: 35000000,
    buyNowPrice: 42000000,
    highestBidder: "TranThiB",
    postedDate: "2025-11-12",
    endDate: "2025-11-22",
    bidCount: 28,
  },
  {
    id: 3,
    name: "Đồng hồ Rolex Submariner Date",
    image: "/img/image3.jpg",
    currentPrice: 180000000,
    buyNowPrice: null,
    highestBidder: "LeVanC",
    postedDate: "2025-11-08",
    endDate: "2025-11-30",
    bidCount: 42,
  },
  {
    id: 4,
    name: "iPhone 15 Pro Max 256GB Natural Titanium",
    image: "/img/image4.jpg",
    currentPrice: 28000000,
    buyNowPrice: 32000000,
    highestBidder: "PhamThiD",
    postedDate: "2025-11-15",
    endDate: "2025-11-20",
    bidCount: 35,
  },
  {
    id: 5,
    name: "Sony PlayStation 5 Console + 2 Controllers",
    image: "/img/image5.jpg",
    currentPrice: 12000000,
    buyNowPrice: 15000000,
    highestBidder: "HoangVanE",
    postedDate: "2025-11-05",
    endDate: "2025-11-18",
    bidCount: 22,
  },
  {
    id: 6,
    name: "Tranh sơn dầu phong cảnh cổ điển",
    image: "/img/image1.jpg",
    currentPrice: 8500000,
    buyNowPrice: null,
    highestBidder: "VuThiF",
    postedDate: "2025-11-01",
    endDate: "2025-11-16",
    bidCount: 18,
  },
];

const ITEMS_PER_PAGE = 3;

const AuctionsPage = () => {
  const [filter, setFilter] = useState("all"); // all | active | ending-soon
  const [currentPage, setCurrentPage] = useState(1);

  const filteredAuctions = useMemo(() => {
    const now = new Date();

    switch (filter) {
      case "active":
        return MOCK_AUCTIONS.filter(
          (auction) => new Date(auction.endDate) > now
        );
      case "ending-soon":
        const threeDaysFromNow = new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000
        );
        return MOCK_AUCTIONS.filter((auction) => {
          const endDate = new Date(auction.endDate);
          return endDate > now && endDate <= threeDaysFromNow;
        });
      default:
        return MOCK_AUCTIONS;
    }
  }, [filter]);

  // Reset to page 1 when filter changes
  useMemo(() => {
    setCurrentPage(1);
  }, [filter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAuctions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentAuctions = filteredAuctions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Đấu giá đang tham gia
          </h2>
          <p className="text-gray-600 mt-1">
            Tổng cộng {filteredAuctions.length} sản phẩm
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "active", label: "Đang diễn ra" },
            { id: "ending-soon", label: "Sắp kết thúc" },
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
      {filteredAuctions.length === 0 ? (
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
            {currentAuctions.map((auction) => (
              <ProductCard key={auction.id} product={auction} />
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
export default AuctionsPage;
