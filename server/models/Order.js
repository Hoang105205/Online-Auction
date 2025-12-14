const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema cho phần đánh giá nằm trong Order (Vùng tạm)
const orderFeedbackSchema = new Schema(
  {
    isGood: {
      type: Boolean,
      default: true, // Mặc định là tốt, user sửa lại nếu muốn
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    // Cờ đánh dấu đã push sang User DB chưa để tránh push trùng
    isSynced: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
); // Không cần _id riêng cho sub-document này

const orderSchema = new Schema(
  {
    product: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      name: String, // Lưu cứng tên và ảnh để lỡ Product bị xóa vẫn còn history
      image: String,
      price: Number, // Giá chốt cuối cùng (Final Price)
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Quản lý trạng thái đơn hàng
    status: {
      type: String,
      enum: [
        "pending_payment",      // 1. Chờ người mua điền info
        "pending_confirmation", // 2. Chờ người bán confirm
        "shipping",             // 3. Đang giao hàng
        "delivered",            // 4. Đã nhận hàng (Buyer confirm)
        "completed",            // 5. Thành công (Seller confirm)
        "cancelled",            // 6. Đã hủy
      ],
      default: "pending_payment",
    },

    // (Upload ảnh, địa chỉ)
    fulfillmentInfo: {
      fullName: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      paymentProofImage: {
        type: String,
      }, // Ảnh hóa đơn người mua up
      shippingProofImage: {
        type: String,
      }, // Ảnh hóa đơn vận chuyển người bán up
    },

    // VÙNG CHỨA RATING TẠM THỜI
    reviews: {
      // Đánh giá CỦA Seller DÀNH CHO Buyer
      bySeller: {
        type: orderFeedbackSchema,
        default: () => ({}), // Khởi tạo object rỗng mặc định
      },
      // Đánh giá CỦA Buyer DÀNH CHO Seller
      byBuyer: {
        type: orderFeedbackSchema,
        default: () => ({}),
      },
    },

    // Thời gian các mốc quan trọng (để sort hoặc tính deadline 24h)
    timelines: {
      paymentSubmitted: { 
        type: Date 
      }, // Lúc buyer up ảnh
      sellerConfirmed: { 
        type: Date 
      }, // Lúc seller bấm gửi hàng (shipping)
      buyerReceived: { 
        type: Date 
      }, // Lúc buyer bấm đã nhận hàng (delivered)
      finished: { 
        type: Date 
      }, // Lúc completed hoặc cancelled
    },
  },
  {
    timestamps: true,
    collection: "orders",
  }
);

// Indexes để query nhanh lịch sử đơn hàng
orderSchema.index({ sellerId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ "product.id": 1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
