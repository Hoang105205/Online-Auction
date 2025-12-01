const ProductService = require("../services/ProductService");

class ProductController {
  // GET /products/:id - Get basic details of a product by ID
  static async getProductBasicDetails(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const productDetails = await ProductService.getProductBasicDetails(id);

      return res.status(200).json(productDetails);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting product details" });
    }
  }

  // POST /products - Create product (with optional uploaded images)
  static async createProduct(req, res) {
    try {
      console.log(
        "[ProductController.createProduct] user:",
        req.user && (req.user.id || req.user._id)
      );

      console.log(
        "[ProductController.createProduct] files:",
        Array.isArray(req.files) ? req.files.length : 0,
        "bodyKeys:",
        req.body ? Object.keys(req.body) : []
      );

      // Parse payload (multipart or JSON)
      let payload = {};
      if (req.body) {
        if (req.body.product) {
          try {
            payload =
              typeof req.body.product === "string"
                ? JSON.parse(req.body.product)
                : req.body.product;
          } catch (e) {
            payload = req.body.product;
          }
        } else {
          payload = req.body;
        }
      }

      // Get sellerId from user
      let sellerId = null;
      if (req.user) {
        sellerId =
          (typeof req.user === "string"
            ? req.user
            : req.user.id || req.user._id) || null;
      }
      sellerId = sellerId || "6922ec91a628dffaa2414479"; // fallback dev

      const newProduct = await ProductService.createProduct(
        payload,
        req.files,
        sellerId
      );

      return res
        .status(201)
        .json({ product: newProduct, message: "Product created" });
    } catch (error) {
      console.error("[ProductController.createProduct] Error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Error creating product" });
    }
  }

  // GET /products/auction/:id - Get auction details of a product by ID
  static async getProductAuction(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const productAuction = await ProductService.getProductAuction(id);

      return res.status(200).json(productAuction);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting product auction" });
    }
  }

  // GET /products/description/:id - Get product description by ID
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

  // PUT /products/description/:id - Update product description by ID
  static async updateDescription(req, res) {
    try {
      const { id } = req.params;
      const { description } = req.body;

      const sellerId = req.user; // get seller from authenticated user

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

  // GET /products/qa/:id - Get product Q&A by ID
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

  // POST /products/qa/:id - Add a new Q entry for a product by ID
  static async addQuestion(req, res) {
    try {
      const { id } = req.params;
      const { message, type } = req.body;
      const sendId = req.user;

      if (!id || !message) {
        return res
          .status(400)
          .json({ error: "Product ID, message, and type are required" });
      }

      const chat = await ProductService.addQuestion(
        id,
        sendId,
        message,
        type || "public"
      );

      return res.status(201).json({
        chat,
        message: "Question added successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error adding question" });
    }
  }

  // POST /products/qa/:id/reply/:chatId - Add a new A entry for a product by ID
  static async addReply(req, res) {
    try {
      const { id, chatId } = req.params;
      const { message } = req.body;
      const sellerId = req.user;

      if (!id || !chatId || !message) {
        return res
          .status(400)
          .json({ error: "Product ID, chat ID, and message are required" });
      }

      const chat = await ProductService.addReply(id, chatId, sellerId, message);

      return res.status(201).json({
        chat,
        message: "Reply added successfully",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error adding reply" });
    }
  }

  // GET /products/auction-history/:id - Get auction history details for a product by ID
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

  // GET /products/related/:id - Get related product by ID
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

  static async uploadImage(req, res) {
    try {
      const publicId = req.file.filename; // Cloudinary publicId
      const imageUrl = req.file.path; // full URL (nếu cần)

      return res.json({
        publicId,
        url: imageUrl,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /products - Get first 5 products
  static async getFirstProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const products = await ProductService.getFirstProducts(limit);
      return res.status(200).json(products);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message || "Error getting products" });
    }
  }
}

module.exports = ProductController;
