const Order = require("../models/Order");
const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

class OrderService {
  static async createInitialOrder(data, session) {
    // data bao gồm: productId, productName, productImage, price, sellerId, buyerId

    const existingOrder = await Order.findOne({
      "product.id": data.productId,
      status: { $ne: "cancelled" },
    }).session(session);

    if (existingOrder) {
      return existingOrder;
    }

    const newOrder = new Order({
      product: {
        id: data.productId,
        name: data.productName,
        image: data.productImage,
        price: data.price,
      },
      sellerId: data.sellerId,
      buyerId: data.buyerId,
      status: "pending_payment", // Trạng thái mặc định
    });

    await newOrder.save({ session });
    return newOrder;
  }

  static async updateRatingDraft(productId, userId, { isGood, content }) {
    const order = await Order.findOne({
      "product.id": productId,
      $or: [{ sellerId: userId }, { buyerId: userId }],
    }).exec();

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.statusCode = 404;
      throw error;
    }

    if (["completed", "cancelled"].includes(order.status)) {
      const error = new Error(
        "Không thể cập nhật đánh giá cho đơn hàng đã hoàn tất hoặc hủy"
      );
      error.statusCode = 400;
      throw error;
    }

    const isSeller = order.sellerId.toString() === userId.toString();
    const isBuyer = order.buyerId.toString() === userId.toString();

    if (isSeller) {
      order.reviews.bySeller.isGood = isGood;
      order.reviews.bySeller.content = content || "";
      order.reviews.bySeller.lastUpdated = new Date();
      order.reviews.bySeller.isSynced = false; // Đánh dấu chưa sync
    } else if (isBuyer) {
      order.reviews.byBuyer.isGood = isGood;
      order.reviews.byBuyer.content = content || "";
      order.reviews.byBuyer.lastUpdated = new Date();
      order.reviews.byBuyer.isSynced = false; // Đánh dấu chưa sync
    } else {
      const error = new Error(
        "Người dùng không có quyền cập nhật đánh giá cho đơn hàng này"
      );
      error.statusCode = 400; // Bad Request
      throw error;
    }

    await order.save();

    return { message: "Cập nhật đánh giá thành công" };
  }

  static async finalizeOrder(productId, sellerId) {
    const session = await mongoose.startSession();
    try {
      let result;

      await session.withTransaction(async () => {
        // 1. Tìm đơn hàng dựa trên ProductId và SellerId
        const order = await Order.findOne({
          "product.id": productId,
          sellerId: sellerId,
        }).session(session);

        if (!order) {
          const error = new Error("Không tìm thấy đơn hàng cho sản phẩm này.");
          error.statusCode = 404;
          throw error;
        }

        // 2. Validate Status: Phải là 'delivered'
        if (order.status !== "delivered") {
          const error = new Error(
            "Chỉ có thể hoàn tất khi người mua đã xác nhận nhận hàng."
          );
          error.statusCode = 400;
          throw error;
        }

        // 3. Update Status
        order.status = "completed";
        order.timelines.finished = new Date();
        order.reviews.bySeller.isSynced = true;
        order.reviews.byBuyer.isSynced = true;

        // 4. SYNC RATING (2 CHIỀU)
        // Seller -> Buyer
        await User.findByIdAndUpdate(
          order.buyerId,
          {
            $push: {
              feedBackAsBidder: {
                commenterId: order.sellerId,
                isGood: order.reviews.bySeller.isGood,
                content: order.reviews.bySeller.content,
                date: order.reviews.bySeller.lastUpdated || new Date(),
              },
            },
          },
          { session }
        );

        // Buyer -> Seller
        await User.findByIdAndUpdate(
          order.sellerId,
          {
            $push: {
              feedBackAsSeller: {
                commenterId: order.buyerId,
                isGood: order.reviews.byBuyer.isGood,
                content: order.reviews.byBuyer.content,
                date: order.reviews.byBuyer.lastUpdated || new Date(),
              },
            },
          },
          { session }
        );

        // 5. Chuyển status product
        await Product.findByIdAndUpdate(
          productId,
          {
            $set: { "auction.status": "ended" },
          },
          { session }
        );

        await order.save({ session });
        result = { message: "Giao dịch thành công!" };
      });
      return result;
    } catch (error) {
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async cancelOrder(productId, sellerId) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        // 1. Tìm đơn hàng
        const order = await Order.findOne({
          "product.id": productId,
          sellerId: sellerId,
        }).session(session);

        if (!order) {
          const error = new Error("Không tìm thấy đơn hàng cho sản phẩm này.");
          error.statusCode = 404;
          throw error;
        }

        // 2. Validate: Không thể hủy nếu đã xong hoặc đã hủy rồi
        if (["completed", "cancelled"].includes(order.status)) {
          const error = new Error("Đơn hàng đã kết thúc, không thể hủy.");
          error.statusCode = 400;
          throw error;
        }

        // 3. Update Status
        order.status = "cancelled";
        order.timelines.finished = new Date();

        order.reviews.bySeller.isGood = false;
        order.reviews.bySeller.content = "Người thắng không thanh toán";
        order.reviews.bySeller.lastUpdated = new Date();

        // 4. SYNC RATING
        order.reviews.bySeller.isSynced = true;
        order.reviews.byBuyer.isSynced = true;

        await User.findByIdAndUpdate(
          order.buyerId,
          {
            $push: {
              feedBackAsBidder: {
                commenterId: order.sellerId,
                isGood: false,
                content: "Người thắng không thanh toán",
                date: new Date(),
              },
            },
          },
          { session }
        );

        // Buyer -> Seller
        await User.findByIdAndUpdate(
          order.sellerId,
          {
            $push: {
              feedBackAsSeller: {
                commenterId: order.buyerId,
                isGood: order.reviews.byBuyer.isGood,
                content: order.reviews.byBuyer.content,
                date: order.reviews.byBuyer.lastUpdated || new Date(),
              },
            },
          },
          { session }
        );

        // 5. Chuyển status product
        await Product.findByIdAndUpdate(
          productId,
          {
            $set: { "auction.status": "cancelled" },
          },
          { session }
        );

        await order.save({ session });

        result = { message: "Đã hủy đơn hàng!" };
      });
      return result;
    } catch (error) {
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async getOrderByProductId(productId, userId) {
    try {
      const order = await Order.findOne({ "product.id": productId })
        .populate("sellerId", "fullName email")
        .populate("buyerId", "fullName email address");

      if (!order) {
        throw new Error("Order not found for the given product ID");
      }

      if (
        order.buyerId._id.toString() !== userId &&
        order.sellerId._id.toString() !== userId
      ) {
        throw new Error("Unauthorized access to this order");
      }

      return order;
    } catch (error) {
      throw new Error("Error retrieving order: " + error.message);
    }
  }

  static async submitPaymentInfo(productId, userId, paymentInfo) {
    try {
      const order = await Order.findOne({ "product.id": productId });

      if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
      }

      // Check if user is the buyer
      if (order.buyerId.toString() !== userId) {
        const error = new Error(
          "Chỉ người mua mới có thể gửi thông tin thanh toán"
        );
        error.statusCode = 403;
        throw error;
      }

      // Check if status is pending_payment
      if (order.status !== "pending_payment") {
        const error = new Error("Đơn hàng không ở trạng thái chờ thanh toán");
        error.statusCode = 400;
        throw error;
      }

      // Update fulfillment info
      order.fulfillmentInfo.fullName = paymentInfo.fullName;
      order.fulfillmentInfo.address = paymentInfo.address;
      order.fulfillmentInfo.paymentProofImage = paymentInfo.paymentProofImage;

      // Update status and timeline
      order.status = "pending_confirmation";
      order.timelines.paymentSubmitted = new Date();

      await order.save();

      return {
        message: "Gửi thông tin thanh toán thành công",
        order,
      };
    } catch (error) {
      throw error;
    }
  }

  static async submitShippingInfo(productId, userId, shippingProofImage) {
    try {
      const order = await Order.findOne({ "product.id": productId });

      if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
      }

      // Check if user is the seller
      if (order.sellerId.toString() !== userId) {
        const error = new Error(
          "Chỉ người bán mới có thể gửi thông tin vận chuyển"
        );
        error.statusCode = 403;
        throw error;
      }

      // Check if status is pending_confirmation
      if (order.status !== "pending_confirmation") {
        const error = new Error("Đơn hàng không ở trạng thái chờ xác nhận");
        error.statusCode = 400;
        throw error;
      }

      // Update fulfillment info
      order.fulfillmentInfo.shippingProofImage = shippingProofImage;

      // Update status and timeline
      order.status = "shipping";
      order.timelines.sellerConfirmed = new Date();

      await order.save();

      return {
        message: "Xác nhận gửi hàng thành công",
        order,
      };
    } catch (error) {
      throw error;
    }
  }

  static async confirmDelivery(productId, userId) {
    try {
      const order = await Order.findOne({ "product.id": productId });

      if (!order) {
        const error = new Error("Không tìm thấy đơn hàng");
        error.statusCode = 404;
        throw error;
      }

      // Check if user is the buyer
      if (order.buyerId.toString() !== userId) {
        const error = new Error(
          "Chỉ người mua mới có thể xác nhận đã nhận hàng"
        );
        error.statusCode = 403;
        throw error;
      }

      // Check if status is shipping
      if (order.status !== "shipping") {
        const error = new Error("Đơn hàng không ở trạng thái đang giao hàng");
        error.statusCode = 400;
        throw error;
      }

      // Update status and timeline
      order.status = "delivered";
      order.timelines.buyerReceived = new Date();

      await order.save();

      return {
        message: "Xác nhận đã nhận hàng thành công",
        order,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderService;
