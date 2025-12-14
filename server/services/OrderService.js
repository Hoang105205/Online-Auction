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
}

module.exports = OrderService;
