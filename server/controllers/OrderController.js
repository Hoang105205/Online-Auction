const OrderService = require("../services/OrderService");
const ProductService = require("../services/ProductService");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

const submitPaymentInfo = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;
    const { fullName, address } = req.body;
    const file = req.file;

    if (!productId || !fullName || !address || !file) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Upload image to Cloudinary
    const imageUrl = await ProductService.uploadImageToCloudinaryCustomFolder({
      file,
      baseFolder: "orders",
      orderId: productId,
      index: 0,
    });

    if (!imageUrl) {
      return res.status(500).json({ message: "Upload ảnh thất bại" });
    }

    // Update order with payment info
    const result = await OrderService.submitPaymentInfo(productId, userId, {
      fullName,
      address,
      paymentProofImage: imageUrl,
    });

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const submitShippingInfo = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;
    const file = req.file;

    if (!productId || !file) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    // Upload image to Cloudinary
    const imageUrl = await ProductService.uploadImageToCloudinaryCustomFolder({
      file,
      baseFolder: "orders",
      orderId: productId,
      index: 1,
    });

    if (!imageUrl) {
      return res.status(500).json({ message: "Upload ảnh thất bại" });
    }

    // Update order with shipping info
    const result = await OrderService.submitShippingInfo(
      productId,
      userId,
      imageUrl
    );

    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const confirmDelivery = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    const result = await OrderService.confirmDelivery(productId, userId);
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
  submitPaymentInfo,
  submitShippingInfo,
  confirmDelivery,
  upload,
};
