const OrderService = require("../services/OrderService");

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

module.exports = {
  updateRatingDraft,
};
