const mongoose = require("mongoose");
const { Schema } = mongoose;

const sellerRequestSchema = new Schema(
  {
    bidderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dateStart: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const subCategorySchema = new Schema({
  subCategoryName: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
});

const categorySchema = new Schema({
  categoryName: {
    type: String,
    trim: true,
  },
  slug: {
    type: String,
    trim: true,
  },
  subCategories: {
    type: [subCategorySchema],
    default: [],
  },
});

const systemSchema = new Schema(
  {
    sellerRequests: {
      type: [sellerRequestSchema],
      default: [],
    },
    // Thời gian kích hoạt gia hạn (trước khi kết thúc)
    autoExtendBefore: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Thời gian gia hạn nếu được kích hoạt
    autoExtendDuration: {
      type: Number,
      default: 0,
      min: 0,
    },
    latestProductTimeConfig: {
      type: Number,
      default: 0,
      min: 0,
    },
    categories: {
      type: [categorySchema],
      default: [],
    },
    mailingSystem: {
      type: String,
      trim: true,
    },
    // additional global settings can be added here
  },
  {
    timestamps: true,
    collection: "app_settings",
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSchema);

module.exports = SystemSetting;
