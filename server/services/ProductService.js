const Product = require("../models/Product");
const User = require("../models/User");

class ProductService {
  // get product basic details (for above information)
  static async getProductBasicDetails(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName feedBackAsSeller")
        .populate("auction.highestBidderId", "fullName feedBackAsBidder")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw new Error("Error getting product details: " + error.message);
    }
  }

  // calculate time remaining for auction (for above information)
  static calculateTimeRemaining(endTime) {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      return {
        expired: true,
        formatted: "Đã kết thúc",
      };
    }

    const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const days = Math.floor(
      (diff % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      expired: false,
      weeks,
      days,
      hours,
      minutes,
      formatted: `${weeks} tuần ${days} ngày ${hours} giờ ${minutes} phút`,
      milliseconds: diff,
    };
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
        receiveId: product.detail.sellerId,
        message,
        time: new Date(),
        replies: [],
      });

      await product.save();

      return product;
    } catch (error) {
      throw new Error("Error adding question: " + error.message);
    }
  }

  // add reply to a question
  static async addReply(productId, chatId, sendId, message) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }

      const chat = product.chat.id(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      chat.replies.push({
        sendId,
        message,
        time: new Date(),
      });

      await product.save();

      return product;
    } catch (error) {
      throw new Error("Error adding reply: " + error.message);
    }
  }

  // get product Q&A
  static async getProductQA(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .populate("chat.receiveId", "fullName")
        .populate("chat.replies.sendId", "fullName")
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

      return {
        numberOfBids: product.auctionHistory.numberOfBids,
        historyList: product.auctionHistory.historyList,
        currentPrice: product.auction.currentPrice,
        stepPrice: product.auction.stepPrice,
        buyNowPrice: product.auction.buyNowPrice,
      };
    } catch (error) {
      throw new Error("Error getting auction history: " + error.message);
    }
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
}

module.exports = ProductService;
