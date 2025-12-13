import { Link } from "react-router-dom";
import ProductImage from "../ProductImage";
import { HiStar } from "react-icons/hi";

const WonProductCard = ({ product, role = "buyer" }) => {
  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  const badgeByStatus = (status) => {
    switch (status) {
      case "pending":
        return { text: "Đang thanh toán", cls: "bg-amber-500" };
      case "ended":
        return { text: "Thành công", cls: "bg-green-600" };
      case "cancelled":
        return { text: "Bị hủy", cls: "bg-red-600" };
      default:
        return { text: status || "—", cls: "bg-gray-500" };
    }
  };

  const badge = badgeByStatus(product.status);

  // role-specific info
  const infoLabel = role === "buyer" ? "Người bán" : "Người thắng";
  const infoName = role === "buyer" ? product.sellerName : product.winnerName;
  const infoRating =
    role === "buyer" ? product.sellerRating : product.winnerRating;

  return (
    <Link to={`/details/${product.id}`}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden group">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <div className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
            <ProductImage url={product.image} />
          </div>
          <div
            className={`absolute top-3 right-3 ${badge.cls} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}
          >
            {badge.text}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>

          {/* Current Price */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Giá cuối cùng</p>
            <p className="text-2xl font-bold text-sky-600">
              {formatPrice(product.currentPrice)}
            </p>
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            {/* Name + Rating in one row, keep rating visible */}
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-gray-600 flex-1 min-w-0">
                {infoLabel}:{" "}
                <span className="font-medium text-gray-900 inline-block max-w-[60%] truncate align-middle">
                  {infoName || "—"}
                </span>
              </span>
              {typeof infoRating === "number" && (
                <span className="flex items-center gap-1 text-xs text-gray-700 flex-shrink-0">
                  <HiStar className="text-amber-500" />
                  <span className="font-medium">{infoRating}%</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>
                Ngày chốt:{" "}
                <span className="font-medium text-gray-900">
                  {formatDate(product.updatedAt)}
                </span>
              </span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-600">
                Số người đấu giá:{" "}
                <span className="font-semibold text-gray-900">
                  {product.bidCount ?? 0}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WonProductCard;
