const ProductService = require("../services/ProductService");

class ProductController {
  // GET /products/:id - Get basic details of a product by ID
  static async getProductBasicDetails(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const product = await ProductService.getProductBasicDetails(id);

      return res.status(200).json(product);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting product details" });
    }
  }

  // GET /products/:id/description - Get product description by ID
  static async getProductDescription(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const description = await ProductService.getProductDescription(id);

      return res.status(200).json(description);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting product description" });
    }
  }

  // PUT /products/:id/description - Update product description by ID
  static async updateDescription(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;
      const sellerId = req.user.id; // mocked

      if (!id || !description) {
        return res
          .status(400)
          .json({ error: "Product ID and description are required" });
      }

      const product = await ProductService.updateDescription(
        id,
        description,
        sellerId
      );

      return res.status(200).json({
        product,
        message: "Product description updated successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error updating product description" });
    }
  }

  // GET /products/:id/qa - Get product Q&A by ID
  static async getProductQA(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const qa = await ProductService.getProductQA(id);

      return res.status(200).json(qa);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting product Q&A" });
    }
  }

  // POST /products/:id/qa - Add a new Q entry for a product by ID
  static async addQuestion(req, res) {
    try {
      const { id } = req.params;
      const { message, type } = req.body;
      const sendId = req.user.id; // mocked

      if (!id || !message) {
        return res
          .status(400)
          .json({ error: "Product ID, message, and type are required" });
      }

      const product = await ProductService.addQuestion(
        id,
        sendId,
        message,
        type || "public"
      );

      return res.status(201).json({
        product,
        message: "Question added successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error adding question" });
    }
  }

  // POST /products/:id/qa/:chatId/reply - Add a new A entry for a product by ID
  static async addReply(req, res) {
    try {
      const { id, chatId } = req.params;
      const { message } = req.body;
      const sendId = req.user.id; // mocked

      if (!id || !chatId || !message) {
        return res
          .status(400)
          .json({ error: "Product ID, chat ID, and message are required" });
      }

      const product = await ProductService.addReply(
        id,
        chatId,
        sendId,
        message
      );

      return res.status(201).json({
        product,
        message: "Reply added successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error adding reply" });
    }
  }

  // GET /products/:id/auction-history - Get auction history details for a product by ID
  static async getAuctionHistory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const auctionHistory = await ProductService.getAuctionHistory(id);

      return res.status(200).json(auctionHistory);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting auction history" });
    }
  }

  // GET /products/:id/related - Get related product by ID
  static async getRelatedProduct(req, res) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const relatedProducts = await ProductService.getRelatedProducts(
        id,
        parseInt(limit) || 5
      );

      return res.status(200).json(relatedProducts);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting related products" });
    }
  }

  // GET /products/:id/time-remaining - Caculate product remaining auction time by ID
  static async getTimeRemaining(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const product = await ProductService.getProductBasicDetails(id);
      const timeRemaining = ProductService.calculateTimeRemaining(
        product.auction.endTime
      );

      return res.status(200).json(timeRemaining);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting time remaining" });
    }
  }
}

module.exports = ProductController;
