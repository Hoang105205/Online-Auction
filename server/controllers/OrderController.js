const OrderService = require("../services/OrderService");

const getOrderByProductId = async (req, res) => {
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
};

const updateRatingDraft = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;
    const { isGood, content } = req.body;

    if (typeof isGood !== "boolean") {
      return res.status(400).json({ message: "'isGood' phải là kiểu boolean" });
    }

    if (!productId || !content) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const result = await OrderService.updateRatingDraft(productId, userId, {
      isGood,
      content,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const finalizeOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const result = await OrderService.finalizeOrder(productId, sellerId);
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const result = await OrderService.cancelOrder(productId, sellerId);
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  getOrderByProductId,
  updateRatingDraft,
  finalizeOrder,
  cancelOrder,
};
