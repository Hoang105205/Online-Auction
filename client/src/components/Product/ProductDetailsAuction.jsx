import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

const ProductDetailsAuction = ({
  productId,
  auctionData,
  auctionHistoryData,
  authUser,
}) => {
  const [bidAmount, setBidAmount] = useState("");

  if (!authUser?.accessToken) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto bg-gray-50 p-8 rounded-lg shadow-md">
          <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2 py-2">
            Vui lòng đăng nhập để tham gia đấu giá sản phẩm này.
          </h3>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (!auctionData || !auctionHistoryData) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">Đang tải dữ liệu đấu giá...</p>
      </div>
    );
  }

  const { currentPrice, stepPrice, buyNowPrice } = auctionData.auction;
  const { numberOfBids, historyList } = auctionHistoryData;

  const maskBidderName = (name) => {
    if (!name || name.length <= 4) return name;
    return name.substring(0, 4) + "***";
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN");
  };

  const formatDateTime = (time) => {
    const date = new Date(time);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleBidSubmit = () => {
    const bidValue = parseInt(bidAmount);
    if (!bidValue) {
      alert("Vui lòng nhập giá đấu giá!");
      return;
    }
    if (bidValue < currentPrice + stepPrice) {
      alert(
        `Giá đấu giá phải ít nhất là ${formatPrice(
          currentPrice + stepPrice
        )} đ!`
      );
      return;
    }
    alert(`Đấu giá thành công với giá ${formatPrice(bidValue)} đ!`);
    setBidAmount("");
  };

  return (
    <div className="py-6 overflow-y-auto max-h-[120vh]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Current Price Info */}
        <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-8 shadow-md">
          {/* Giá hiện tại */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-4">
            <span className="text-base sm:text-lg font-semibold text-gray-700">
              Giá hiện tại:
            </span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">
              {formatPrice(currentPrice)} đ
            </span>
          </div>

          {/* Bid Input */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <label className="text-base sm:text-lg font-semibold text-gray-700 whitespace-nowrap">
              Nhập giá tối đa:
            </label>
            <div className="flex gap-2 flex-1">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Tối thiểu ${formatPrice(
                  currentPrice + stepPrice
                )} đ`}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              />
              <button
                onClick={handleBidSubmit}
                className="bg-blue-600 text-white px-2 sm:px-6 py-2 rounded-lg text-sm sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
              >
                XÁC NHẬN
              </button>
            </div>
          </div>

          {/* Price Info */}
          {buyNowPrice && (
            <div className="mt-4 text-xs sm:text-sm text-gray-600 space-y-1">
              <p>
                • Bước giá: <strong>{formatPrice(stepPrice)} đ</strong>
              </p>
              <p>
                • Giá mua ngay:{" "}
                <strong className="text-red-600">
                  {formatPrice(buyNowPrice)} đ
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* Bid History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Lịch sử đấu giá:
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Tổng số lượt đấu giá: <strong>{numberOfBids}</strong>
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[35%]">
                    Thời điểm
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 w-[35%]">
                    Người ra giá
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 w-[30%]">
                    Giá
                  </th>
                </tr>
              </thead>
            </table>
            <div className="overflow-y-auto max-h-[400px]">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {historyList.length > 0 ? (
                    historyList.map((bid) => (
                      <tr
                        key={bid._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 w-[35%]">
                          <span className="block sm:inline">
                            {formatDateTime(bid.bidTime)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 w-[35%]">
                          <span className="text-xs sm:text-sm font-medium text-gray-800">
                            {maskBidderName(bid.bidderId?.fullName)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right w-[30%]">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {formatPrice(bid.bidPrice)} đ
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-8 sm:py-12 text-gray-500"
                      >
                        <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm sm:text-base">
                          Chưa có lượt đấu giá nào
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Giá đấu phải lớn hơn giá hiện tại ít nhất{" "}
            {formatPrice(stepPrice)} đ. Người đấu giá cao nhất khi hết thời gian
            sẽ được mua sản phẩm.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsAuction;
