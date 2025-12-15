const OrderService = require("../services/OrderService");

class OrderController {
  // GET /api/orders/product/:productId
  static async getOrderByProductId(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user;

      if (!productId) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const order = await OrderService.getOrderByProductId(productId, userId);

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      return res.status(200).json(order);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting order details" });
    }
  }
}

module.exports = OrderController;
