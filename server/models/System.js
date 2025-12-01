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
  subCategoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
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
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
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
    autoExtendBefore: {
      type: Number,
      default: 0,
      min: 0,
    },
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
