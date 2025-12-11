const mongoose = require("mongoose");
const { Schema } = mongoose;

const bidHistorySchema = new Schema({
  bidderId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  bidPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  bidTime: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema({
  type: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  sendId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  reply: {
    message: {
      type: String,
      trim: true,
    },
    time: {
      type: Date,
    },
  },
});

const productSchema = new Schema(
  {
    detail: {
      sellerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
      category: {
        type: String,
        required: true,
        trim: true,
      },
      subCategory: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      images: {
        type: [String],
        default: [],
      },
      followers: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    auction: {
      startPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      stepPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      buyNowPrice: {
        type: Number,
        default: 0,
        min: 0,
      },
      currentPrice: {
        type: Number,
        default: 0,
        min: 0,
      },
      highestBidderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      startTime: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
        required: true,
      },
      autoExtend: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        enum: ["active", "pending", "ended", "cancelled"], // active: ongoing auction; pending: end auction but still in cash process; ended: auction ended and cleared; cancelled: auction cancelled by seller
        default: "active",
      },
      bidders: {
        type: Number,
        default: 0,
        min: 0,
      },
      bannedBidders: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    auctionHistory: {
      numberOfBids: {
        type: Number,
        default: 0,
        min: 0,
      },
      historyList: {
        type: [bidHistorySchema],
        default: [],
      },
    },
    chat: {
      type: [chatSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "products",
  }
);

// Indexes
productSchema.index({ "detail.sellerId": 1 });
productSchema.index({ "detail.category": 1 });
productSchema.index({ "detail.subCategory": 1 });
productSchema.index({ "auction.status": 1 });
productSchema.index({ "auction.endTime": 1 });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
