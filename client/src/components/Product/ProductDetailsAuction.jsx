import React, { useState, useEffect } from "react";
import { Clock, Crown, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import { toast } from "react-toastify";

import { placeBid, kickBidder } from "../../api/auctionService";
import { getAuctionHistory } from "../../api/productService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const ProductDetailsAuction = ({
  productId,
  auctionData,
  auctionHistoryData,
  authUser,
  productStatus,
  onBidSuccess,
  isSeller,
}) => {
  const axiosPrivate = useAxiosPrivate();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [kickingBidder, setKickingBidder] = useState(null);

  const [localHistoryData, setLocalHistoryData] = useState(auctionHistoryData);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const itemsPerPage = 10;

  const isBanned = auctionData?.auction?.bannedBidders?.includes(authUser?.id);

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
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="py-12 text-center">
        <div className="max-w-md mx-auto bg-red-50 p-8 rounded-lg shadow-md border border-red-200">
          <Ban className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">
            Bạn đã bị seller từ chối đấu giá
          </h3>
          <p className="text-gray-600">
            Bạn không thể tham gia đấu giá sản phẩm này nữa.
          </p>
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

  const { currentPrice, stepPrice, buyNowPrice, startPrice } =
    auctionData.auction;

  const highestBidderId = auctionData.auction.highestBidderId?._id;

  const isFirstBid =
    auctionHistoryData.numberOfBids === 0 ||
    auctionHistoryData.historyList === undefined
      ? true
      : false;

  const minBidPrice = isFirstBid ? startPrice : currentPrice + stepPrice;

  const maxBidPrice = buyNowPrice || null;

  const handlePageChange = async (newPage) => {
    if (newPage < 1 || newPage > pagination?.totalPages) return;

    try {
      setIsRefreshing(true);
      const updatedHistory = await getAuctionHistory(
        productId,
        axiosPrivate,
        newPage,
        itemsPerPage
      );
      setLocalHistoryData(updatedHistory);
      setPagination(updatedHistory.pagination);
      setCurrentPage(newPage);
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tải trang!");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleKickBidder = async (bidderId, bidderName) => {
    const toastId = toast.warn(
      <div>
        <p className="font-semibold mb-2">Chặn người đấu giá</p>
        <p className="mb-3">
          Bạn có chắc chắn muốn chặn{" "}
          <strong>{maskBidderName(bidderName)}</strong>?
        </p>
        <p className="text-xs text-gray-600 mb-3">
          Người này sẽ không thể tham gia đấu giá sản phẩm này nữa.
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}>
          <button
            onClick={async () => {
              toast.dismiss(toastId);

              try {
                setKickingBidder(bidderId);

                await kickBidder(axiosPrivate, {
                  productId,
                  bidderId,
                });

                toast.success("Đã chặn người đấu giá thành công!");

                if (onBidSuccess) {
                  await onBidSuccess();
                }
              } catch (error) {
                toast.error(
                  error.response?.data?.message ||
                    "Có lỗi xảy ra khi chặn người đấu giá!"
                );
              } finally {
                setKickingBidder(null);
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}>
            Xác nhận
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Hủy
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };
  const { numberOfBids, historyList } = localHistoryData ||
    auctionHistoryData || { numberOfBids: 0, historyList: [] };

  const timesOut =
    auctionData.auction.endTime < new Date().toISOString() ? true : false;

  useEffect(() => {
    if (auctionHistoryData) {
      setLocalHistoryData(auctionHistoryData);
      setPagination(auctionHistoryData.pagination);
    }
  }, [auctionHistoryData]);

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
    if (isSubmitting) return;

    const bidValue = parseInt(bidAmount);

    if (!bidValue) {
      toast.error("Vui lòng nhập giá đấu giá!");
      return;
    }

    if (buyNowPrice && bidValue >= buyNowPrice) {
      const toastId = toast.warn(
        <div>
          <p>
            Mức giá bạn đặt đã vượt giá mua ngay {formatPrice(buyNowPrice)} đ!
          </p>
          <p>Bạn có chắc chắn muốn mua ngay sản phẩm này?</p>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}>
            <button
              onClick={() => {
                handleBuyNow(buyNowPrice);
                toast.dismiss(toastId);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
              Xác nhận
            </button>
            <button
              onClick={() => toast.dismiss(toastId)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}>
              Hủy
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
        }
      );
      return;
    }

    if (isFirstBid) {
      if (bidValue < startPrice) {
        toast.error(
          `Giá đấu giá phải ít nhất là ${formatPrice(startPrice)} đ!`
        );
        return;
      }
    } else {
      if (bidValue < currentPrice + stepPrice) {
        toast.error(
          `Giá đấu giá phải ít nhất là ${formatPrice(
            currentPrice + stepPrice
          )} đ!`
        );
        return;
      }

      if (
        bidValue > currentPrice + stepPrice &&
        (bidValue - currentPrice) % stepPrice !== 0
      ) {
        toast.error(
          `Giá đấu giá trừ giá hiện tại phải chia hết cho ${formatPrice(
            stepPrice
          )} đ!`
        );
        return;
      }
    }

    handleBidSuccess(bidValue);
  };

  // Hàm xử lý mua ngay
  const handleBuyNow = async (price) => {
    try {
      const result = await placeBid(axiosPrivate, {
        productId: productId,
        bidAmount: price,
      });

      toast.success(result.message);

      setBidAmount("");

      if (onBidSuccess) {
        await onBidSuccess();
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Có lỗi xảy ra khi mua ngay!";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý đấu giá thành công
  const handleBidSuccess = async (price) => {
    const toastId = toast.info(
      <div>
        <p className="font-semibold mb-2">Xác nhận đấu giá</p>
        <p className="mb-3">
          Bạn có chắc chắn muốn đặt giá <strong>{formatPrice(price)} đ</strong>?
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}>
          <button
            onClick={async () => {
              toast.dismiss(toastId);

              try {
                setIsSubmitting(true);
                const result = await placeBid(axiosPrivate, {
                  productId: productId,
                  bidAmount: price,
                });

                toast.success(result.message);

                setBidAmount("");

                if (onBidSuccess) {
                  await onBidSuccess();
                }
              } catch (error) {
                const errorMsg =
                  error.response?.data?.message || "Có lỗi xảy ra khi đấu giá!";
                toast.error(errorMsg);
              } finally {
                setIsSubmitting(false);
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}>
            Xác nhận
          </button>
          <button
            onClick={() => {
              toast.dismiss(toastId);
              setIsSubmitting(false);
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}>
            Hủy
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage, totalPages } = pagination;
    const pages = [];

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isRefreshing}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {pages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && handlePageChange(page)}
            disabled={page === "..." || isRefreshing}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : page === "..."
                ? "cursor-default"
                : "border border-gray-300 hover:bg-gray-50"
            } ${page === "..." ? "" : "min-w-[40px]"}`}>
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isRefreshing}
          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="py-6 overflow-y-auto max-h-[120vh]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Current Price Info */}
        {productStatus === "active" && !timesOut && (
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg mb-8 shadow-md">
            {/* Giá hiện tại */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 mb-4">
              <span className="text-base sm:text-lg font-semibold text-gray-700">
                {isFirstBid ? "Giá khởi điểm:" : "Giá hiện tại:"}
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
                  onFocus={(e) => {
                    // Tự động điền giá tối thiểu khi focus vào ô trống
                    if (!bidAmount) {
                      setBidAmount(minBidPrice.toString());
                    }
                  }}
                  placeholder={`Tối thiểu ${formatPrice(minBidPrice)} đ${
                    maxBidPrice ? ` - Tối đa ${formatPrice(maxBidPrice)} đ` : ""
                  }`}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleBidSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-2 sm:px-6 py-2 rounded-lg text-sm sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md whitespace-nowrap">
                  {isSubmitting ? "Đang xử lý..." : "XÁC NHẬN"}
                </button>
              </div>
            </div>

            {/* Price Info */}
            <div className="mt-4 text-xs sm:text-sm text-gray-600 space-y-1">
              {isFirstBid ? (
                <>
                  <p>
                    • Giá khởi điểm:{" "}
                    <strong>{formatPrice(startPrice)} đ</strong>
                  </p>
                  <p>
                    • Bước giá: <strong>{formatPrice(stepPrice)} đ</strong>
                  </p>
                  {buyNowPrice && (
                    <p>
                      • Giá mua ngay:{" "}
                      <strong className="text-red-600">
                        {formatPrice(buyNowPrice)} đ
                      </strong>
                    </p>
                  )}
                  <p className="text-green-600 font-medium">
                    ✓ Lần đấu giá đầu tiên: Có thể đặt từ{" "}
                    {formatPrice(startPrice)} đ{" "}
                    {buyNowPrice
                      ? `đến ${formatPrice(buyNowPrice)} đ`
                      : "trở lên"}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    • Bước giá: <strong>{formatPrice(stepPrice)} đ</strong>
                  </p>
                  <p>
                    • Giá tối thiểu tiếp theo:{" "}
                    <strong className="text-blue-600">
                      {formatPrice(currentPrice + stepPrice)} đ
                    </strong>
                  </p>
                  {buyNowPrice && (
                    <p>
                      • Giá mua ngay:{" "}
                      <strong className="text-red-600">
                        {formatPrice(buyNowPrice)} đ
                      </strong>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Bid History */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md">
          <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-b">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Lịch sử đấu giá:
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Tổng số lượt đấu giá: <strong>{numberOfBids}</strong>
                {pagination && (
                  <span className="ml-2">
                    (Trang {pagination.currentPage}/{pagination.totalPages})
                  </span>
                )}
              </p>
            </div>
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
                  {isSeller && productStatus === "active" && (
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700 w-[15%]">
                      Chặn
                    </th>
                  )}
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
                        className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 w-[35%]">
                          <span className="block sm:inline">
                            {formatDateTime(bid.bidTime)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 w-[35%]">
                          <div className="flex items-center gap-1">
                            {bid.bidderId?._id === highestBidderId && (
                              <Crown className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                            )}
                            <span className="text-xs sm:text-sm font-medium text-gray-800">
                              {maskBidderName(bid.bidderId?.fullName)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right w-[30%]">
                          <span className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {formatPrice(bid.bidPrice)} đ
                          </span>
                        </td>
                        {isSeller && productStatus === "active" && (
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-center w-[15%]">
                            <button
                              onClick={() =>
                                handleKickBidder(
                                  bid.bidderId._id,
                                  bid.bidderId?.fullName
                                )
                              }
                              disabled={kickingBidder === bid.bidderId._id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Chặn">
                              <Ban className="w-3 h-3" />
                              {kickingBidder === bid.bidderId._id
                                ? "Đang chặn..."
                                : "Chặn"}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-8 sm:py-12 text-gray-500">
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

        {/* Pagination */}
        {renderPagination()}

        {/* Note */}
        <div className="mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Lưu ý:</strong>{" "}
            {isFirstBid ? (
              <>
                Lần đấu giá đầu tiên có thể đặt giá từ{" "}
                <strong>{formatPrice(startPrice)} đ</strong>
                {buyNowPrice && (
                  <>
                    {" "}
                    đến <strong>{formatPrice(buyNowPrice)} đ</strong>
                  </>
                )}
                . Từ lần thứ 2, giá đấu phải lớn hơn giá hiện tại ít nhất{" "}
                <strong>{formatPrice(stepPrice)} đ</strong> và chia hết cho bước
                giá.
              </>
            ) : (
              <>
                Giá đấu phải lớn hơn giá hiện tại ít nhất{" "}
                <strong>{formatPrice(stepPrice)} đ</strong> và chia hết cho bước
                giá.
              </>
            )}{" "}
            Người đấu giá cao nhất khi hết thời gian sẽ được mua sản phẩm. Nếu
            có giá mua ngay và người dùng đặt giá bằng hoặc cao hơn giá mua
            ngay, người đó sẽ mua được sản phẩm ngay lập tức.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsAuction;
