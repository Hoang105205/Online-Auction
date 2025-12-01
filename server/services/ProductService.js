const Product = require("../models/Product");
const User = require("../models/User");

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
