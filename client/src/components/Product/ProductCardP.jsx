import { HiClock, HiUser, HiTag, HiShoppingCart } from "react-icons/hi";
import { Link } from "react-router-dom";
import { Button } from "flowbite-react";

const ProductCardP = ({ product, isWon = false }) => {
  // Calculate time remaining
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return "Đã kết thúc";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    // If more than 3 days, show absolute date
    if (days > 3) {
      return end.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }

    // If 3 days or less, show relative time
    if (days > 0) return `${days} ngày ${hours} giờ`;
    if (hours > 0) return `${hours} giờ ${minutes} phút`;
    return `${minutes} phút`;
  };

  // Mask bidder name (show first 4 characters)
  const maskBidderName = (name) => {
    if (!name || name.length <= 4) return name;
    return name.substring(0, 4) + "***";
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const timeRemaining = getTimeRemaining(product.endDate);
  const isEnded = timeRemaining === "Đã kết thúc";

  return (
    <Link to={`/details/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {!isEnded && (
            <Button
              className="
              absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 
              group-hover:opacity-100 group-hover:translate-y-0
              translate-y-4 transition-all duration-300 w-[80%]"
            >
              Đấu giá ngay
            </Button>
          )}
          {isWon && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              ✓ Đã thắng
            </div>
          )}
          {!isWon && isEnded && (
            <div className="absolute top-3 right-3 bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Đã kết thúc
            </div>
          )}

        </div>

        {/* Content */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>

          {/* Current Price */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Giá hiện tại</p>
            <p className="text-2xl font-bold text-sky-600">
              {formatPrice(product.currentPrice)}
            </p>
          </div>

          {/* Info Grid */}
          <div className="space-y-2 text-sm">
            {/* Highest Bidder - Only show if not won */}
            {!isWon && product.highestBidder && (
              <div className="flex items-center gap-2 text-gray-600">
                <HiUser className="text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  Bởi:{" "}
                  <span className="font-medium text-gray-900">
                    {maskBidderName(product.highestBidder)}
                  </span>
                </span>
              </div>
            )}

            {/* Buy Now Price - Only show if not won and has buyNowPrice */}
            {!isWon && product.buyNowPrice && (
              <div className="flex items-center gap-2 text-gray-600">
                <HiShoppingCart className="text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  Mua ngay:{" "}
                  <span className="font-medium text-green-600">
                    {formatPrice(product.buyNowPrice)}
                  </span>
                </span>
              </div>
            )}

            {/* Posted Date */}
            <div className="flex items-center gap-2 text-gray-600">
              <HiTag className="text-gray-400 flex-shrink-0" />
              <span>Ngày đăng: {formatDate(product.postedDate)}</span>
            </div>

            {/* Time Remaining - Only show if not won */}
            {!isWon && (
              <div className="flex items-center gap-2 text-gray-600">
                <HiClock className="text-gray-400 flex-shrink-0" />
                <span
                  className={`font-medium ${
                    isEnded ? "text-gray-500" : "text-orange-600"
                  }`}
                >
                  {timeRemaining}
                </span>
              </div>
            )}

            {/* Bid Count - Only show if not won */}
            {!isWon && (
              <div className="pt-2 border-t">
                <span className="text-gray-600">
                  Số lượt đặt giá:{" "}
                  <span className="font-semibold text-gray-900">
                    {product.bidCount}
                  </span>
                </span>
              </div>
            )}

            {/* Won Date - Only show if won */}
            {isWon && product.wonDate && (
              <div className="pt-2 border-t">
                <span className="text-gray-600">
                  Ngày thắng:{" "}
                  <span className="font-semibold text-green-600">
                    {formatDate(product.wonDate)}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardP;
