const AuctionService = require("../services/AuctionService");

const placeBid = async (req, res) => {
  try {
    const userId = req.user;

    const { productId, bidAmount } = req.body;

    if (!productId || !bidAmount) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đủ thông tin." });
    }

    const result = await AuctionService.placeBid(productId, userId, bidAmount);

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

const kickBidder = async (req, res) => {
  try {
    const sellerId = req.user;

    const { productId, bidderId } = req.body;

    if (!productId || !bidderId) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp đủ thông tin." });
    }

    const result = await AuctionService.kickBidder(
      productId,
      sellerId,
      bidderId
    );

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

module.exports = { placeBid, kickBidder };
