const ProductService = require("../services/ProductService");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

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
    function getPublicId(url) {
      const parts = url.split("products/");
      if (parts.length < 2) return null;

      const rest = parts[1]; // "692be247386a087837e12afe/1764483664931_2.png"
      const withoutExt = rest.replace(/\.[^/.]+$/, ""); // bỏ .png

      return "products/" + withoutExt;
    }
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
      // product may be sent as JSON fields or as a `product` JSON string in multipart/form-data
      let payload = {};
      if (req.body) {
        // if client sent a field named `product` containing JSON
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

      // sellerId from authenticated user if available
      let sellerId = null;
      if (req.user) {
        // `verifyJWT` sets req.user to decoded.UserInfo.id (a string)
        if (typeof req.user === "string") sellerId = req.user;
        else sellerId = (req.user.id || req.user._id || null)?.toString();
      }
      // fallback for development/testing
      sellerId = sellerId || "6922ec91a628dffaa2414479";

      // build product document according to Product schema
      // Basic payload validation to avoid Mongoose validation errors
      if (!payload.endDate) {
        return res.status(400).json({ error: "endDate is required" });
      }
      // validate endDate
      const endTimeParsed = Date.parse(payload.endDate);
      if (isNaN(endTimeParsed)) {
        return res.status(400).json({ error: "Invalid endDate format" });
      }
      const startPriceVal = Number(payload.startingPrice || payload.startPrice);
      const stepPriceVal = Number(payload.step || payload.stepPrice);

      if (!startPriceVal || startPriceVal <= 0) {
        return res.status(400).json({ error: "Invalid starting price" });
      }
      if (!stepPriceVal || stepPriceVal <= 0) {
        return res.status(400).json({ error: "Invalid step price" });
      }

      if (!payload.productName && !payload.name) {
        return res.status(400).json({ error: "Product name is required" });
      }

      if (
        !payload.category &&
        !(payload.category && payload.category.name) &&
        !payload.categoryName
      ) {
        return res.status(400).json({ error: "Category is required" });
      }

      if (
        !payload.subcategory &&
        !(payload.subcategory && payload.subcategory.name) &&
        !payload.subCategory
      ) {
        return res.status(400).json({ error: "Subcategory is required" });
      }

      const detail = {
        sellerId: sellerId,
        name: payload.productName || payload.name || "(No name)",
        category:
          payload.category?.name ||
          payload.category ||
          payload.categoryName ||
          "",
        subCategory:
          payload.subcategory?.name ||
          payload.subcategory ||
          payload.subCategory ||
          "",
        description: payload.description || "",
        images: [],
      };

      const auction = {
        startPrice: startPriceVal,
        stepPrice: stepPriceVal,
        buyNowPrice: Number(payload.buyNowPrice) || 0,
        currentPrice: Number(payload.startingPrice) || 0,
        highestBidderId: "6922ec91a628dffaa2414479",
        startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
        endTime: payload.endDate ? new Date(payload.endDate) : null,
        autoExtend: !!payload.autoExtend,
        status:
          payload.startTime && new Date(payload.startTime) > new Date()
            ? "pending"
            : "active",
      };

      const newProduct = new Product({ detail, auction });
      await newProduct.save();

      // if files were uploaded, handle two cases:
      // - multer-storage-cloudinary already uploaded them (f.path / f.location present)
      // - memory upload: files are in buffer and we should upload via Cloudinary SDK into folder products/<productId>
      if (Array.isArray(req.files) && req.files.length > 0) {
        const urls = [];
        for (let i = 0; i < req.files.length; i++) {
          const f = req.files[i];
          if (f.path || f.location || f.url) {
            // already uploaded by storage engine
            urls.push(f.path || f.location || f.url);
            continue;
          }

          if (f.buffer) {
            // upload buffer via Cloudinary SDK using data URI
            const dataUri = `data:${f.mimetype};base64,${f.buffer.toString(
              "base64"
            )}`;
            try {
              const result = await cloudinary.uploader.upload(dataUri, {
                folder: `products/${newProduct._id}`,
                public_id: `${Date.now()}_${i}`,
                quality: "auto",
                fetch_format: "auto",
                transformation: [{ width: 1800, height: 1800, crop: "limit" }],
              });
              if (result && (result.secure_url || result.url)) {
                const fullUrl = result.secure_url || result.url;
                const publicId = getPublicId(fullUrl);

                urls.push(publicId);
              }
            } catch (uploadErr) {
              console.error("Cloudinary upload error for one file:", uploadErr);
            }
          }
        }

        // attach uploaded urls to product
        newProduct.detail.images = urls.filter(Boolean);
        await newProduct.save();
      }

      return res
        .status(201)
        .json({ product: newProduct, message: "Product created" });
    } catch (error) {
      console.error(error);
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
      // const sendId = req.user.id; // mocked
      const sendId = "6922ec91a628dffaa2414479"; // hardcoded for testing

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

  // POST /products/qa/:id/reply/:chatId - Add a new A entry for a product by ID
  static async addReply(req, res) {
    try {
      const { id, chatId } = req.params;
      const { message } = req.body;
      // const sendId = req.user.id; // mocked
      const sendId = "6922ec91a628dffaa2414479"; // hardcoded for testing

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
}

module.exports = ProductController;
