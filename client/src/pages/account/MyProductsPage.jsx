import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Tooltip } from "flowbite-react";
import {
  HiPlus,
  HiChevronLeft,
  HiChevronRight,
  HiLockClosed,
} from "react-icons/hi";
import ProductCard from "../../components/ProductCard";

// Mock data for products user has posted
const MOCK_MY_PRODUCTS = [
  {
    id: 201,
    name: "Laptop Dell XPS 15 9520 i7-12700H",
    image: "/img/image1.jpg",
    currentPrice: 32000000,
    buyNowPrice: 38000000,
    highestBidder: "TranVanA",
    postedDate: "2025-11-10",
    endDate: "2025-11-28",
    bidCount: 12,
  },
  {
    id: 202,
    name: "Ghế gaming DXRacer Formula Series",
    image: "/img/image2.jpg",
    currentPrice: 4500000,
    buyNowPrice: 5500000,
    highestBidder: "NguyenThiB",
    postedDate: "2025-11-12",
    endDate: "2025-11-25",
    bidCount: 8,
  },
  {
    id: 203,
    name: "Bộ bàn phím + chuột Logitech MX Keys Combo",
    image: "/img/image3.jpg",
    currentPrice: 3200000,
    buyNowPrice: null,
    highestBidder: "LeVanC",
    postedDate: "2025-11-08",
    endDate: "2025-12-01",
    bidCount: 15,
  },
  {
    id: 204,
    name: "Màn hình LG UltraGear 27 inch 144Hz",
    image: "/img/image4.jpg",
    currentPrice: 6800000,
    buyNowPrice: 8000000,
    highestBidder: "PhamThiD",
    postedDate: "2025-11-15",
    endDate: "2025-11-22",
    bidCount: 20,
  },
  {
    id: 205,
    name: "Ổ cứng SSD Samsung 980 Pro 2TB",
    image: "/img/image5.jpg",
    currentPrice: 4200000,
    buyNowPrice: 5000000,
    highestBidder: "HoangVanE",
    postedDate: "2025-11-05",
    endDate: "2025-11-20",
    bidCount: 18,
  },
  {
    id: 206,
    name: "Webcam Logitech Brio 4K Ultra HD",
    image: "/img/image1.jpg",
    currentPrice: 3500000,
    buyNowPrice: 4200000,
    highestBidder: "VuThiF",
    postedDate: "2025-11-01",
    endDate: "2025-11-18",
    bidCount: 10,
  },
];

const ITEMS_PER_PAGE = 3;

export default function MyProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);

  // Mock user seller status - replace with actual user data from context/API
  const isSeller = true; // Change to true to test seller view

  // Pagination calculations
  const totalPages = Math.ceil(MOCK_MY_PRODUCTS.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = MOCK_MY_PRODUCTS.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm đã đăng</h2>
          <p className="text-gray-600 mt-1">
            Tổng cộng {MOCK_MY_PRODUCTS.length} sản phẩm
          </p>
        </div>

        {/* Create Product Button */}
        {isSeller ? (
          <Link to="/account/my-products/create-product">
            <Button className="bg-sky-600 hover:bg-sky-700" size="lg">
              <HiPlus className="mr-2 h-5 w-5" />
              Đăng sản phẩm
            </Button>
          </Link>
        ) : (
          <Tooltip content="Bạn cần có quyền Seller để đăng sản phẩm">
            <Button disabled size="lg" color="gray">
              <HiLockClosed className="mr-2 h-5 w-5" />
              Đăng sản phẩm
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Products Grid */}
      {MOCK_MY_PRODUCTS.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn chưa đăng sản phẩm nào.{" "}
            {isSeller
              ? "Hãy bắt đầu đăng sản phẩm đầu tiên!"
              : "Bạn cần có quyền Seller để đăng sản phẩm."}
          </p>
        </div>
      ) : (
        <>
          {/* Show Products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
}
