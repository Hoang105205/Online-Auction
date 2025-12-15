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
}

module.exports = OrderService;
