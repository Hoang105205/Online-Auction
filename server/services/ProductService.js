const Product = require("../models/Product");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

class ProductService {
  // get product basic details (for above information)
  static async getProductBasicDetails(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName feedBackAsSeller")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        detail: product.detail,
      };
    } catch (error) {
      throw new Error("Error getting product details: " + error.message);
    }
  }

  static async getProductAuction(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("auction.highestBidderId", "fullName feedBackAsBidder")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      return {
        auction: product.auction,
      };
    } catch (error) {
      throw new Error("Error getting product auction: " + error.message);
    }
  }

  // update product description
  static async updateDescription(productId, newContent, sellerId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.detail.sellerId.toString() !== sellerId) {
        throw new Error(
          "Unauthorized: Only the seller can update the description"
        );
      }

      product.detail.description = newContent;
      await product.save();

      return product;
    } catch (error) {
      throw new Error("Error updating description: " + error.message);
    }
  }

  // get product description
  static async getProductDescription(productId) {
    try {
      const product = await Product.findById(productId).exec();
      if (!product) {
        throw new Error("Product not found");
      }
      return product.detail.description;
    } catch (error) {
      throw new Error("Error getting product description: " + error.message);
    }
  }

  // add question to ProductDetailsQNA
  static async addQuestion(productId, sendId, message, type = "public") {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      product.chat.push({
        type,
        sendId,
        message,
        time: new Date(),
        reply: {},
      });

      await product.save();

      await product.populate("chat.sendId", "fullName");

      return product.chat;
    } catch (error) {
      throw new Error("Error adding question: " + error.message);
    }
  }

  // add reply to a question
  static async addReply(productId, chatId, sellerId, message) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      // Verify seller
      if (product.detail.sellerId.toString() !== sellerId) {
        throw new Error("Unauthorized: Only the seller can add replies");
      }

      const chat = product.chat.id(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      if (chat.reply && chat.reply.message) {
        throw new Error("Reply already exists for this question");
      }

      chat.reply = {
        message,
        time: new Date(),
      };

      await product.save();

      await product.populate("chat.sendId", "fullName");

      return product.chat;
    } catch (error) {
      throw new Error("Error adding reply: " + error.message);
    }
  }

  // get product Q&A
  static async getProductQA(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }
      return product.chat;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
    }
  }

  // get product auction history
  static async getAuctionHistory(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("auctionHistory.historyList.bidderId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      const sortedHistoryList = product.auctionHistory.historyList.sort(
        (a, b) => b.bidPrice - a.bidPrice
      );

      return {
        numberOfBids: product.auctionHistory.numberOfBids,
        historyList: sortedHistoryList,
      };
    } catch (error) {
      throw new Error("Error getting auction history: " + error.message);
    }
  }

  // create product (with optional uploaded images)
  static async createProduct(payload, files, userId) {
    function getPublicId(url) {
      const parts = url.split("products/");
      if (parts.length < 2) return null;

      const rest = parts[1]; // "692be247386a087837e12afe/1764483664931_2.png"
      const withoutExt = rest.replace(/\.[^/.]+$/, ""); // bỏ .png

      return "products/" + withoutExt;
    }

    // --- VALIDATION ---
    if (!payload.endDate) throw new Error("endDate is required");

    const endTimeParsed = Date.parse(payload.endDate);
    if (isNaN(endTimeParsed)) throw new Error("Invalid endDate format");

    const startPriceVal = Number(payload.startingPrice || payload.startPrice);
    const stepPriceVal = Number(payload.step || payload.stepPrice);

    if (!startPriceVal || startPriceVal <= 0)
      throw new Error("Invalid starting price");

    if (!stepPriceVal || stepPriceVal <= 0)
      throw new Error("Invalid step price");

    if (!payload.productName && !payload.name)
      throw new Error("Product name is required");

    if (
      !payload.category &&
      !(payload.category && payload.category.name) &&
      !payload.categoryName
    )
      throw new Error("Category is required");

    if (
      !payload.subcategory &&
      !(payload.subcategory && payload.subcategory.name) &&
      !payload.subCategory
    )
      throw new Error("Subcategory is required");

    // --- BUILD DETAIL + AUCTION ---
    const detail = {
      sellerId: userId,
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
      buyNowPrice: Number(payload.buyNowPrice) || null,
      currentPrice: Number(payload.startingPrice) || null,
      highestBidderId: null,
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

    // --- HANDLE IMAGES ---
    if (Array.isArray(files) && files.length > 0) {
      const urls = [];

      for (let i = 0; i < files.length; i++) {
        const f = files[i];

        // If multer already uploaded
        if (f.path || f.location || f.url) {
          urls.push(f.path || f.location || f.url);
          continue;
        }

        // Upload buffer → Cloudinary
        if (f.buffer) {
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

            if (result?.secure_url || result?.url) {
              const full = result.secure_url || result.url;
              urls.push(getPublicId(full));
            }
          } catch (err) {
            console.error("Cloudinary upload error:", err);
          }
        }
      }

      newProduct.detail.images = urls.filter(Boolean);
      await newProduct.save();
    }

    return newProduct;
  }

  // take 5 ralated products from the same category
  static async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        "detail.category": product.detail.category,
        "auction.status": "active",
      })
        .limit(limit)
        .select(
          "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.bidders auction.startTime auction.endTime auction.highestBidderId"
        )
        .populate("auction.highestBidderId", "fullName")
        .exec();

      return relatedProducts;
    } catch (error) {
      throw new Error("Error getting related products: " + error.message);
    }
  }

  static async getFirstProducts(limit = 5) {
    try {
      const products = await Product.find()
        .limit(limit)
        .populate("detail.sellerId", "fullName feedBackAsSeller")
        .populate("auction.highestBidderId", "fullName") // lấy tên highest bidder
        .exec();

      return products.map((product) => ({
        id: product._id,
        name: product.detail.name,
        image: product.detail.images?.[0] || null, // lấy ảnh đầu tiên
        currentPrice:
          product.auction.currentPrice || product.auction.startPrice || 0,
        buyNowPrice: product.auction.buyNowPrice || null,
        highestBidder: product.auction.highestBidderId?.fullName || null,
        postedDate: product.createdAt?.toISOString().split("T")[0] || null,
        endDate: product.auction.endTime?.toISOString().split("T")[0] || null,
        bidCount: product.auctionHistory.numberOfBids || 0,
      }));
    } catch (error) {
      throw new Error("Error getting products: " + error.message);
    }
  }

  static async;
}

module.exports = ProductService;
