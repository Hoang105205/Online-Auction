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

      return product.chat.filter((chat) => chat.type === "public");
    } catch (error) {
      throw new Error("Error adding question: " + error.message);
    }
  }

  // chat in product PrivateChat between highest bidder and seller
  static async addPrivateChat(productId, sendId, message, type = "private") {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.auction.status !== "pending") {
        throw new Error("Private chat only available during pending status.");
      }

      const isSeller = product.detail.sellerId.toString() === sendId;
      const isHighestBidder =
        product.auction.highestBidderId &&
        product.auction.highestBidderId.toString() === sendId;

      if (!isSeller && !isHighestBidder) {
        throw new Error(
          "Unauthorized: Only the seller or highest bidder can chat privately"
        );
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

      return product.chat.filter((chat) => chat.type === "private");
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

  // Get product public Q&A
  static async getProductPublicQA(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }
      const publicChats = product.chat.filter((chat) => chat.type === "public");

      return publicChats;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
    }
  }

  // Get product private Q&A
  static async getProductPrivateQA(productId, userId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      // Check if auction has ended bidding (aka: pending, ended, cancelled)
      const endAuction = product.auction.status !== "active";

      if (!endAuction) {
        throw new Error(
          "Auction is still active. Private Q&A not available yet."
        );
      }

      const isHighestBidder =
        product.auction.highestBidderId &&
        product.auction.highestBidderId.toString() === userId;

      const isSeller = product.detail.sellerId.toString() === userId;

      if (!isHighestBidder && !isSeller) {
        throw new Error(
          "Unauthorized: Only the highest bidder or seller can access private Q&A"
        );
      }

      const privateChats = product.chat.filter(
        (chat) => chat.type === "private"
      );

      return privateChats;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
    }
  }

  // get product auction history
  static async getAuctionHistory(productId, limit = 20) {
    try {
      const product = await Product.findById(productId)
        .select("auction auctionHistory")
        .populate("auctionHistory.historyList.bidderId", "fullName")
        .lean() // chi thuan doc data va tra ve object thuong cho nhe
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      // get current price
      const currentHighestPrice = product.auction.currentPrice;

      // sort historyList by bidTime descending and limit results (default 20)
      let historyList = product.auctionHistory?.historyList || [];
      historyList.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

      const limitedHistory = historyList.slice(0, limit);

      const processedHistory = limitedHistory.map((bid) => {
        const displayBid = { ...bid };

        if (displayBid.bidPrice > currentHighestPrice) {
          displayBid.bidPrice = currentHighestPrice;
        }
        return displayBid;
      });

      return {
        numberOfBids: product.auctionHistory.numberOfBids,
        historyList: processedHistory,
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

  // take 5 ralated products from the same subcategory, if not enough, finding more in category, if still not enough, fiding more from current seller, if still not enough, finding any active products
  static async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      let relatedProducts = [];

      // same subcategory
      relatedProducts = await Product.find({
        _id: { $ne: productId },
        "detail.subCategory": product.detail.subCategory,
        "auction.status": "active",
      })
        .limit(limit)
        .select(
          "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
        )
        .populate("auction.highestBidderId", "fullName")
        .exec();

      // same category
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const categoryProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "detail.category": product.detail.category,
          "detail.subCategory": { $ne: product.detail.subCategory },
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...categoryProducts];
      }

      // same seller
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const sellerProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "detail.sellerId": product.detail.sellerId,
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...sellerProducts];
      }

      // any active products
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const activeProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...activeProducts];
      }

      // if still not enough, return whatever found
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const randomProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...randomProducts];
      }

      const formattedProducts = relatedProducts.map((p) => {
        const bidderInfo = p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice,
          buyNowPrice: p.auction.buyNowPrice,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.auction.startTime || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory?.numberOfBids || 0,
        };
      });

      return formattedProducts;
    } catch (error) {
      throw new Error("Error getting related products: " + error.message);
    }
  }

  static async getFirstProducts({
    page = 1,
    limit = 5,
    sortBy = "",
    search = "",
  }) {
    try {
      let products;
      let totalItems;

      // Use aggregation pipeline for both search and non-search cases
      const pipeline = [];

      // Add $search stage only if search query exists
      if (search && search.trim()) {
        pipeline.push({
          $search: {
            index: "product_name",
            text: {
              query: search,
              path: "detail.name",
            },
          },
        });
      }

      // Filter non-ended products for mostBids and highestPrice
      if (
        sortBy === "mostBids" ||
        sortBy === "highestPrice" ||
        sortBy === "endingSoon"
      ) {
        pipeline.push({
          $match: {
            "auction.endTime": { $gt: new Date() },
          },
        });
      }

      // Add calculated field and sorting
      if (sortBy === "endTime") {
        pipeline.push({
          $sort: { "auction.endTime": -1, "auction.startTime": -1 },
        });
      } else if (sortBy === "priceAsc") {
        pipeline.push({
          $sort: { "auction.currentPrice": 1, "auction.startTime": -1 },
        });
      } else if (sortBy === "endingSoon") {
        pipeline.push({ $sort: { "auction.endTime": -1 } });
      } else if (sortBy === "mostBids") {
        pipeline.push({
          $sort: { "auctionHistory.numberOfBids": -1, "auction.endTime": -1 },
        });
      } else if (sortBy === "highestPrice") {
        pipeline.push({
          $sort: { "auction.currentPrice": -1, "auction.endTime": -1 },
        });
      } else {
        pipeline.push({ $sort: { "auction.startTime": -1 } });
      }

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Product.aggregate(countPipeline).exec();
      totalItems = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Lookup to populate fields
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "detail.sellerId",
          foreignField: "_id",
          as: "sellerInfo",
        },
      });
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "auction.highestBidderId",
          foreignField: "_id",
          as: "bidderInfo",
        },
      });

      products = await Product.aggregate(pipeline).exec();

      const formatted = products.map((p) => {
        const sellerInfo = p.sellerInfo?.[0] || p.detail?.sellerId;
        const bidderInfo = p.bidderInfo?.[0] || p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice || p.auction.startPrice || 0,
          buyNowPrice: p.auction.buyNowPrice || null,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.createdAt || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory.numberOfBids || 0,
        };
      });

      return {
        products: formatted,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error("Error getting products: " + error.message);
    }
  }

  static async getProductsByCategory({
    category,
    subcategory,
    page = 1,
    limit = 0,
    sortBy = "",
    search = "",
  }) {
    try {
      let products;
      let totalItems;

      // Use aggregation pipeline for both search and non-search cases
      const pipeline = [];

      // Add $search stage only if search query exists
      if (search && search.trim()) {
        pipeline.push({
          $search: {
            index: "product_name",
            text: {
              query: search,
              path: "detail.name",
            },
          },
        });
      }

      // Add category filter
      pipeline.push({
        $match: {
          "detail.category": category,
          ...(subcategory && { "detail.subCategory": subcategory }),
        },
      });

      // Add calculated field and sorting
      if (sortBy === "endTime") {
        pipeline.push({
          $sort: { "auction.endTime": -1, "auction.startTime": -1 },
        });
      } else if (sortBy === "priceAsc") {
        pipeline.push({
          $sort: { "auction.currentPrice": 1, "auction.startTime": -1 },
        });
      } else {
        pipeline.push({ $sort: { "auction.startTime": -1 } });
      }

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Product.aggregate(countPipeline).exec();
      totalItems = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Lookup to populate highestBidderId
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "auction.highestBidderId",
          foreignField: "_id",
          as: "bidderInfo",
        },
      });

      products = await Product.aggregate(pipeline).exec();

      const formatted = products.map((p) => {
        const bidderInfo = p.bidderInfo?.[0] || p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice,
          buyNowPrice: p.auction.buyNowPrice,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.auction.startTime || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory.numberOfBids,
        };
      });

      return {
        products: formatted,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          limit: parseInt(limit),
        },
      };
    } catch (err) {
      throw new Error("Error getting products: " + err.message);
    }
  }

  static async;
}

module.exports = ProductService;
