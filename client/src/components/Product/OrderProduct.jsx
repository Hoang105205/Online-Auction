import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Upload,
  Clock,
  AlertCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Edit2,
  Ban,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { toast } from "react-toastify";

import PrivateChat from "./PrivateChat.jsx";
import ProductImage from "../ProductImage";
import { getOrderByProductId, cancelOrder } from "../../api/orderService";

import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const OrderProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  // state
  const [currentUserId, setCurrentUserId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);
  const [shippingProof, setShippingProof] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dropdown states
  const [expandedSteps, setExpandedSteps] = useState({});

  // Review states - Riêng cho từng role
  const [buyerReviewType, setBuyerReviewType] = useState("good");
  const [buyerReviewContent, setBuyerReviewContent] = useState("");
  const [buyerEditingReview, setBuyerEditingReview] = useState(false);

  const [sellerReviewType, setSellerReviewType] = useState("good");
  const [sellerReviewContent, setSellerReviewContent] = useState("");
  const [sellerEditingReview, setSellerEditingReview] = useState(false);

  // current userId
  useEffect(() => {
    if (auth?.id) {
      setCurrentUserId(auth.id);
    }
  }, [auth]);

  // fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!productId) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getOrderByProductId(productId, axiosPrivate);
        setOrder(data);

        // pre-fill form data
        if (data.fulfillmentInfo) {
          setFullName(data.fulfillmentInfo.fullName || "");
          setAddress(data.fulfillmentInfo.address || "");
        }

        if (data.reviews?.byBuyer) {
          setBuyerReviewType(data.reviews.byBuyer.isGood ? "good" : "bad");
          setBuyerReviewContent(data.reviews.byBuyer.content || "");
        }

        if (data.reviews?.bySeller) {
          setSellerReviewType(data.reviews.bySeller.isGood ? "good" : "bad");
          setSellerReviewContent(data.reviews.bySeller.content || "");
        }
      } catch (err) {
        console.error("Error fetching order data:", err);
        setError(err.response?.data?.error || "Failed to load order data");
        toast.error("Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [productId, axiosPrivate]);

  // determine role
  const isBuyer = currentUserId === order?.buyerId?._id;
  const isSeller = currentUserId === order?.sellerId?._id;

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") || "0";
  };

  const formatDateTime = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN");
  };

  const toggleStep = (step) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  // Get step status
  const getStepStatus = (step) => {
    const statusOrder = [
      "pending_payment",
      "pending_confirmation",
      "shipping",
      "delivered",
      "completed",
      "cancelled",
    ];

    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);

    if (order.status === "cancelled") {
      return stepIndex <= currentIndex ? "completed" : "pending";
    }

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: {
        text: "Chờ thanh toán",
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
      },
      pending_confirmation: {
        text: "Chờ xác nhận",
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
      },
      shipping: {
        text: "Đang giao hàng",
        color: "bg-purple-100 text-purple-800",
        icon: Truck,
      },
      delivered: {
        text: "Đã nhận hàng",
        color: "bg-green-100 text-green-800",
        icon: Package,
      },
      completed: {
        text: "Hoàn thành",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      cancelled: {
        text: "Đã hủy",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  // Handle Cancel Order
  const handleCancelOrder = () => {
    const toastId = toast.warn(
      <div>
        <p className="font-semibold mb-2">Hủy đơn hàng</p>
        <p className="mb-3">Bạn có chắc chắn muốn hủy đơn hàng này?</p>
        <p className="text-xs text-gray-600 mb-3">
          Bạn sẽ không thể hoàn tác hành động này.
        </p>
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={async () => {
              toast.dismiss(toastId);

              try {
                // cancel api
                await cancelOrder(productId, axiosPrivate);
                toast.success("Đã hủy đơn hàng thành công!");

                // Cập nhật trạng thái đơn hàng trong UI
              } catch (error) {
                toast.error(
                  error.response?.data?.message ||
                    "Có lỗi xảy ra khi hủy đơn hàng!"
                );
              } finally {
                setSubmitting(false);
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
            }}
          >
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
            }}
          >
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

  // ==================== STEP 1: PENDING PAYMENT ====================
  const StepPendingPayment = () => {
    const status = getStepStatus("pending_payment");
    if (status === "pending") return null;

    const isCompleted = status === "completed";
    const isCurrent = status === "current";

    return (
      <div className="mb-4">
        <div
          onClick={() => isCompleted && toggleStep("pending_payment")}
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            isCurrent
              ? "border-yellow-500 bg-yellow-50"
              : "border-green-500 bg-green-50 hover:bg-green-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className="font-bold text-lg">
                Bước 1: Thanh toán & Gửi thông tin
              </h3>
              <p className="text-sm text-gray-600">
                {isCompleted
                  ? `Đã hoàn thành - ${formatDateTime(
                      order.timelines?.paymentSubmitted
                    )}`
                  : "Đang chờ người mua gửi thông tin"}
              </p>
            </div>
          </div>
          {isCompleted && (
            <div>
              {expandedSteps.pending_payment ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {/* ✅ Hiển thị content khi current HOẶC khi completed + expanded */}
        {(isCurrent || (isCompleted && expandedSteps.pending_payment)) && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            {isCompleted ? (
              // Completed - Hiển thị info
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Họ và tên: </span>
                  <span>{order.fulfillmentInfo?.fullName}</span>
                </div>
                <div>
                  <span className="font-semibold">Địa chỉ: </span>
                  <span>{order.fulfillmentInfo?.address}</span>
                </div>
                {order.fulfillmentInfo?.paymentProofImage && (
                  <div>
                    <p className="font-semibold mb-2">Ảnh chuyển khoản:</p>
                    <img
                      src={order.fulfillmentInfo.paymentProofImage}
                      alt="Payment proof"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ) : isCurrent && isBuyer ? (
              // Current + Buyer - Form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Địa chỉ nhận hàng <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Ảnh chuyển khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {paymentProof && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Đã chọn: {paymentProof.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => alert("Gửi thông tin (Chưa implement)")}
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? "Đang gửi..." : "Gửi thông tin thanh toán"}
                </button>
              </div>
            ) : isCurrent && isSeller ? (
              // Current + Seller - Waiting
              <div className="text-center py-6">
                <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                <p className="text-gray-700">
                  Đang chờ người mua gửi thông tin thanh toán...
                </p>
              </div>
            ) : (
              // Fallback
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">
                  Không thể xác định vai trò
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  isBuyer: {isBuyer.toString()} | isSeller:{" "}
                  {isSeller.toString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ==================== STEP 2: PENDING CONFIRMATION ====================
  const StepPendingConfirmation = () => {
    const status = getStepStatus("pending_confirmation");
    if (status === "pending") return null;

    const isCompleted = status === "completed";
    const isCurrent = status === "current";

    return (
      <div className="mb-4">
        <div
          onClick={() => isCompleted && toggleStep("pending_confirmation")}
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            isCurrent
              ? "border-blue-500 bg-blue-50"
              : "border-green-500 bg-green-50 hover:bg-green-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-blue-600" />
            )}
            <div>
              <h3 className="font-bold text-lg">Bước 2: Xác nhận & Gửi hàng</h3>
              <p className="text-sm text-gray-600">
                {isCompleted
                  ? `Đã hoàn thành - ${formatDateTime(
                      order.timelines?.sellerConfirmed
                    )}`
                  : "Đang chờ người bán xác nhận"}
              </p>
            </div>
          </div>
          {isCompleted && (
            <div>
              {expandedSteps.pending_confirmation ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {(isCurrent || (isCompleted && expandedSteps.pending_confirmation)) && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            {isCompleted ? (
              <div className="space-y-2">
                {order.fulfillmentInfo?.shippingProofImage && (
                  <div>
                    <p className="font-semibold mb-2">Ảnh vận chuyển:</p>
                    <img
                      src={order.fulfillmentInfo.shippingProofImage}
                      alt="Shipping proof"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}
              </div>
            ) : isCurrent && isSeller ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-semibold mb-2">
                    Thông tin người mua:
                  </p>
                  <p className="text-gray-700">
                    <strong>Tên:</strong> {order.fulfillmentInfo?.fullName}
                  </p>
                  <p className="text-gray-700">
                    <strong>Địa chỉ:</strong> {order.fulfillmentInfo?.address}
                  </p>
                  {order.fulfillmentInfo?.paymentProofImage && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">
                        Ảnh chuyển khoản:
                      </p>
                      <img
                        src={order.fulfillmentInfo.paymentProofImage}
                        alt="Payment proof"
                        className="w-full max-w-md rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Upload ảnh vận chuyển{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setShippingProof(e.target.files[0])}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  {shippingProof && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Đã chọn: {shippingProof.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => alert("Xác nhận gửi hàng (Chưa implement)")}
                  disabled={submitting || !shippingProof}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? "Đang xác nhận..." : "Xác nhận đã gửi hàng"}
                </button>
              </div>
            ) : isCurrent && isBuyer ? (
              <div className="text-center py-6">
                <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700">
                  Đang chờ người bán xác nhận và gửi hàng...
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">
                  Không thể xác định vai trò
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ==================== STEP 3: SHIPPING ====================
  const StepShipping = () => {
    const status = getStepStatus("shipping");
    if (status === "pending") return null;

    const isCompleted = status === "completed";
    const isCurrent = status === "current";

    return (
      <div className="mb-4">
        <div
          onClick={() => isCompleted && toggleStep("shipping")}
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${
            isCurrent
              ? "border-purple-500 bg-purple-50"
              : "border-green-500 bg-green-50 hover:bg-green-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Truck className="w-6 h-6 text-purple-600" />
            )}
            <div>
              <h3 className="font-bold text-lg">Bước 3: Đang giao hàng</h3>
              <p className="text-sm text-gray-600">
                {isCompleted
                  ? `Đã hoàn thành - ${formatDateTime(
                      order.timelines?.buyerReceived
                    )}`
                  : "Đang chờ người mua xác nhận đã nhận hàng"}
              </p>
            </div>
          </div>
          {isCompleted && (
            <div>
              {expandedSteps.shipping ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {(isCurrent || (isCompleted && expandedSteps.shipping)) && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            {isCompleted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-700">
                  Đã giao hàng thành công
                </p>
              </div>
            ) : isCurrent && isBuyer ? (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Đơn hàng đang được vận chuyển. Vui lòng xác nhận khi đã nhận
                  hàng.
                </p>
                {order.fulfillmentInfo?.shippingProofImage && (
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Ảnh vận chuyển từ người bán:
                    </p>
                    <img
                      src={order.fulfillmentInfo.shippingProofImage}
                      alt="Shipping proof"
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}
                <button
                  onClick={() => alert("Xác nhận nhận hàng (Chưa implement)")}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đã nhận hàng"}
                </button>
              </div>
            ) : isCurrent && isSeller ? (
              <div className="text-center py-6">
                <Truck className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <p className="text-gray-700">
                  Đang chờ người mua xác nhận đã nhận hàng...
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">
                  Không thể xác định vai trò
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ==================== STEP 4: DELIVERED ====================
  const StepDelivered = () => {
    const status = getStepStatus("delivered");
    if (status === "pending") return null;

    const isCompleted = status === "completed";
    const isCurrent = status === "current";

    return (
      <div className="mb-4">
        <div
          onClick={() => isCompleted && toggleStep("delivered")}
          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
            isCompleted ? "cursor-pointer hover:bg-green-100" : "cursor-default"
          } transition-colors ${
            isCurrent
              ? "border-green-500 bg-green-50"
              : "border-green-500 bg-green-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Package className="w-6 h-6 text-green-600" />
            )}
            <div>
              <h3 className="font-bold text-lg">Bước 4: Đã nhận hàng</h3>
              <p className="text-sm text-gray-600">
                {isCompleted
                  ? `Đã hoàn thành - ${formatDateTime(
                      order.timelines?.finished
                    )}`
                  : "Đang chờ người bán xác nhận hoàn tất"}
              </p>
            </div>
          </div>
          {isCompleted && (
            <div>
              {expandedSteps.delivered ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </div>

        {(isCurrent || (isCompleted && expandedSteps.delivered)) && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            {isCompleted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="font-semibold text-green-700">
                  Giao dịch thành công
                </p>
              </div>
            ) : isCurrent && isSeller ? (
              <div className="space-y-4">
                <p className="text-gray-700">
                  Người mua đã xác nhận nhận hàng. Vui lòng xác nhận hoàn tất
                  giao dịch.
                </p>
                <button
                  onClick={() => alert("Xác nhận hoàn tất (Chưa implement)")}
                  disabled={submitting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận hoàn tất giao dịch"}
                </button>
              </div>
            ) : isCurrent && isBuyer ? (
              <div className="text-center py-6">
                <Package className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-gray-700">
                  Đang chờ người bán xác nhận hoàn tất giao dịch...
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-red-700 font-semibold">
                  Không thể xác định vai trò
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Component Review cho Buyer
  const BuyerReviewSection = () => {
    const hasReview = order.reviews?.byBuyer?.content;
    const isEditing = buyerEditingReview || !hasReview;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Đánh giá người bán
          </h2>
          {hasReview && !isEditing && (
            <button
              onClick={() => setBuyerEditingReview(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}
        </div>

        {isEditing ? (
          // Form đánh giá
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setBuyerReviewType("good")}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  buyerReviewType === "good"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                Tốt
              </button>
              <button
                onClick={() => setBuyerReviewType("bad")}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  buyerReviewType === "bad"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 hover:border-red-300"
                }`}
              >
                <ThumbsDown className="w-5 h-5 mx-auto mb-1" />
                Không tốt
              </button>
            </div>

            <textarea
              value={buyerReviewContent}
              onChange={(e) => setBuyerReviewContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về người bán..."
              rows="4"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert("Lưu đánh giá (Chưa implement)");
                  setBuyerEditingReview(false);
                }}
                disabled={submitting || !buyerReviewContent.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {submitting
                  ? "Đang lưu..."
                  : hasReview
                  ? "Cập nhật đánh giá"
                  : "Gửi đánh giá"}
              </button>
              {hasReview && (
                <button
                  onClick={() => {
                    setBuyerReviewType(
                      order.reviews?.byBuyer?.isGood ? "good" : "bad"
                    );
                    setBuyerReviewContent(
                      order.reviews?.byBuyer?.content || ""
                    );
                    setBuyerEditingReview(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        ) : (
          // Hiển thị đánh giá đã có
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {order.reviews?.byBuyer?.isGood ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <ThumbsUp className="w-4 h-4" />
                  Tốt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  <ThumbsDown className="w-4 h-4" />
                  Không tốt
                </span>
              )}
              <span className="text-xs text-gray-500">
                • {formatDateTime(order.reviews?.byBuyer?.lastUpdated)}
              </span>
            </div>
            <p className="text-gray-700">{order.reviews?.byBuyer?.content}</p>
          </div>
        )}
      </div>
    );
  };

  // Component Review cho Seller
  const SellerReviewSection = () => {
    const hasReview = order.reviews?.bySeller?.content;
    const isEditing = sellerEditingReview || !hasReview;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5" />
            Đánh giá người mua
          </h2>
          {hasReview && !isEditing && (
            <button
              onClick={() => setSellerEditingReview(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setSellerReviewType("good")}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  sellerReviewType === "good"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-300 hover:border-green-300"
                }`}
              >
                <ThumbsUp className="w-5 h-5 mx-auto mb-1" />
                Tốt
              </button>
              <button
                onClick={() => setSellerReviewType("bad")}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  sellerReviewType === "bad"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 hover:border-red-300"
                }`}
              >
                <ThumbsDown className="w-5 h-5 mx-auto mb-1" />
                Không tốt
              </button>
            </div>

            <textarea
              value={sellerReviewContent}
              onChange={(e) => setSellerReviewContent(e.target.value)}
              placeholder="Đánh giá về người mua..."
              rows="4"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert("Lưu đánh giá (Chưa implement)");
                  setSellerEditingReview(false);
                }}
                disabled={submitting || !sellerReviewContent.trim()}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {submitting
                  ? "Đang lưu..."
                  : hasReview
                  ? "Cập nhật đánh giá"
                  : "Gửi đánh giá"}
              </button>
              {hasReview && (
                <button
                  onClick={() => {
                    setSellerReviewType(
                      order.reviews?.bySeller?.isGood ? "good" : "bad"
                    );
                    setSellerReviewContent(
                      order.reviews?.bySeller?.content || ""
                    );
                    setSellerEditingReview(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {order.reviews?.bySeller?.isGood ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                  <ThumbsUp className="w-4 h-4" />
                  Tốt
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  <ThumbsDown className="w-4 h-4" />
                  Không tốt
                </span>
              )}
              <span className="text-xs text-gray-500">
                • {formatDateTime(order.reviews?.bySeller?.lastUpdated)}
              </span>
            </div>
            <p className="text-gray-700">{order.reviews?.bySeller?.content}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold text-lg mb-2">
            Có lỗi xảy ra
          </p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không tìm thấy đơn hàng</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Chi tiết đơn hàng
              </h1>
              {getStatusBadge(order.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Mã đơn hàng:</p>
                <p className="font-semibold">{order._id}</p>
              </div>
              <div>
                <p className="text-gray-600">Ngày chốt giá:</p>
                <p className="font-semibold">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>

            {/* Grid responsive: 1 cột trên mobile, 2 cột trên desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ảnh chiếm 1/3 trên màn hình lớn, full width trên mobile */}
              <div className="lg:col-span-1">
                <ProductImage
                  url={order.product.image}
                  alt={order.product.name}
                  defaultWidth="100%"
                  defaultHeight="auto"
                />
              </div>

              {/* Thông tin chiếm 2/3 trên màn hình lớn */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-lg mb-2">
                  {order.product.name}
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-4">
                  {formatPrice(order.product.price)} đ
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-gray-600 text-sm">Người bán:</p>
                    <p className="font-semibold">{order.sellerId?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Người mua:</p>
                    <p className="font-semibold">{order.buyerId?.fullName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Progress Steps */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Tiến trình đơn hàng</h2>

            {order.status === "cancelled" ? (
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="font-bold text-xl text-red-800">
                      Đơn hàng đã bị hủy
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      Hủy lúc: {formatDateTime(order.timelines?.finished)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <StepPendingPayment />
                <StepPendingConfirmation />
                <StepShipping />
                <StepDelivered />

                {order.status === "completed" && (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <h3 className="font-bold text-xl text-green-800">
                          Giao dịch hoàn tất
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          Hoàn thành lúc:{" "}
                          {formatDateTime(order.timelines?.finished)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Cancel Button - Only for Seller */}
          {isSeller &&
            order.status !== "completed" &&
            order.status !== "cancelled" && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <button
                  onClick={handleCancelOrder}
                  disabled={submitting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Ban className="w-5 h-5" />
                  {submitting ? "Đang hủy..." : "Hủy đơn hàng"}
                </button>
              </div>
            )}

          {/* Reviews Section - Only show when completed */}
          {order.status === "completed" && (
            <>
              {isBuyer && <BuyerReviewSection />}
              {isSeller && <SellerReviewSection />}
            </>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Lịch sử đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <p>
                  <strong>Tạo đơn hàng:</strong>{" "}
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              {order.timelines?.paymentSubmitted && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <p>
                    <strong>Thanh toán:</strong>{" "}
                    {formatDateTime(order.timelines.paymentSubmitted)}
                  </p>
                </div>
              )}
              {order.timelines?.sellerConfirmed && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <p>
                    <strong>Gửi hàng:</strong>{" "}
                    {formatDateTime(order.timelines.sellerConfirmed)}
                  </p>
                </div>
              )}
              {order.timelines?.buyerReceived && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <p>
                    <strong>Nhận hàng:</strong>{" "}
                    {formatDateTime(order.timelines.buyerReceived)}
                  </p>
                </div>
              )}
              {order.timelines?.finished && (
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      order.status === "cancelled"
                        ? "bg-red-600"
                        : "bg-gray-600"
                    }`}
                  ></div>
                  <p>
                    <strong>
                      {order.status === "cancelled" ? "Đã hủy:" : "Hoàn thành:"}
                    </strong>{" "}
                    {formatDateTime(order.timelines.finished)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Private Chat Component */}
      <PrivateChat
        productId={order.product.id}
        authUser={isBuyer ? order.buyerId : order.sellerId}
        sellerId={order.sellerId?._id}
        highestBidderId={isBuyer ? order.buyerId?._id : null}
      />
    </>
  );
};

export default OrderProduct;
