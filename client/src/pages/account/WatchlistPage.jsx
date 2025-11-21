import { useState, useMemo } from "react";
import ProductCard from "../../components/ProductCard"
import {
  HiChevronLeft,
  HiChevronRight,
  HiTrash,
} from "react-icons/hi";

const ITEMS_PER_PAGE = 3;

export default function WatchlistPage() {
  const products = [
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
      name: "Sony PlayStation 5 Console + 2 Controllers",
      image: "/img/image5.jpg",
      currentPrice: 12000000,
      buyNowPrice: 15000000,
      highestBidder: "HoangVanE",
      postedDate: "2025-11-05",
      endDate: "2025-11-18",
      bidCount: 22,
    },
  ];
  const [count, setCount] = useState(0);
  const [sortBy, setSortBy] = useState("recent"); // recent | oldest | price-high | price-low
  const [currentPage, setCurrentPage] = useState(1);

  const [auctions, setAuctions] = useState(products);
  const sortedAuctions = useMemo(() => {
    const sorted = [...auctions];  // dùng auctions, KHÔNG dùng products
    setCount(auctions.length);

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
  }, [sortBy, auctions]);

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

  const handleRemove = (id) => {
    setAuctions(prev => prev.filter(item => item.id !== id));
    setCount(auctions.length);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm đã đăng</h2>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              Tổng cộng {count} sản phẩm
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
        {/* Show Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentAuctions.map((product) => (
            <div key={product.id} className="relative">
              {/* Nút xóa */}
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute z-10 top-2 left-2 p-2 bg-white rounded-full shadow hover:bg-gray-100"
              >
                <HiTrash className="w-5 h-5 text-red-500" />
              </button>
              <ProductCard key={product.id} product={product} />
            </div>
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
      </div>
    </div>
  );
}