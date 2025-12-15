const Order = require("../models/Order");

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
      $or: [
        { sellerId: userId },
        { buyerId: userId }
      ]
    }).exec();

    if (!order) {
      const error = new Error("Không tìm thấy đơn hàng");
      error.statusCode = 404;
      throw error;
    }

    if (["completed", "cancelled"].includes(order.status)) {
      const error = new Error("Không thể cập nhật đánh giá cho đơn hàng đã hoàn tất hoặc hủy");
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
    }
    else if (isBuyer) {
      order.reviews.byBuyer.isGood = isGood;
      order.reviews.byBuyer.content = content || "";
      order.reviews.byBuyer.lastUpdated = new Date();
      order.reviews.byBuyer.isSynced = false; // Đánh dấu chưa sync
    }
    else{
      const error = new Error("Người dùng không có quyền cập nhật đánh giá cho đơn hàng này");
      error.statusCode = 400; // Bad Request 
      throw error;
    }

    await order.save();

    return {message: "Cập nhật đánh giá thành công" };
  }
}

module.exports = OrderService;
