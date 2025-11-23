const Product = require("../models/Product");
const User = require("../models/User");

class ProductService {
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
    } catch (error) {
      throw new Error("Error updating description: " + error.message);
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

  // get number of followers
  static async getFollowers(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found");
      }
      return product.detail.followers;
    } catch (error) {
      throw new Error("Error getting followers: " + error.message);
    }
  }

  // get product basic details (for above information)
  static async getProductBasicDetails(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullname feedbackAsSeller")
        .populate("auction.highestBidderId", "fullname feedbackAsBidder")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      throw new Error("Error getting product details: " + error.message);
    }
  }

  // get product Q&A
  static async getProductQA(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullname")
        .populate("chat.receiveId", "fullname")
        .populate("chat.replies.sendId", "fullname")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }
      return product.chat;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
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

  // get product auction
}

module.exports = ProductService;
