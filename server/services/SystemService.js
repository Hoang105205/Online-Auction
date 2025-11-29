const System = require("../models/System");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const ROLES_LIST = require("../config/roles_list");

class SystemService {
  static async getConfig() {
    let sys = await System.findOne().exec();
    if (!sys) {
      sys = await System.create({});
    }
    return sys;
  }

  static async updateConfig(updateData) {
    const sys = await System.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateAutoExtend(autoExtendBefore, autoExtendDuration) {
    const update = {};
    if (autoExtendBefore !== undefined) {
      const n = Number(autoExtendBefore);
      if (Number.isNaN(n) || n < 0) {
        const error = new Error(
          "autoExtendBefore must be a non-negative number"
        );
        error.statusCode = 400;
        throw error;
      }
      update.autoExtendBefore = n;
    }
    if (autoExtendDuration !== undefined) {
      const n = Number(autoExtendDuration);
      if (Number.isNaN(n) || n < 0) {
        const error = new Error(
          "autoExtendDuration must be a non-negative number"
        );
        error.statusCode = 400;
        throw error;
      }
      update.autoExtendDuration = n;
    }

    if (Object.keys(update).length === 0) return await System.findOne().exec();

    const sys = await System.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateLatestProductTimeConfig(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
      const error = new Error(
        "latestProductTimeConfig must be a non-negative number"
      );
      error.statusCode = 400;
      throw error;
    }

    const sys = await System.findOneAndUpdate(
      {},
      { $set: { latestProductTimeConfig: n } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateTimeConfigs({
    autoExtendBefore,
    autoExtendDuration,
    latestProductTimeConfig,
  } = {}) {
    const update = {};
    if (autoExtendBefore !== undefined)
      update.autoExtendBefore = Number(autoExtendBefore);
    if (autoExtendDuration !== undefined)
      update.autoExtendDuration = Number(autoExtendDuration);
    if (latestProductTimeConfig !== undefined)
      update.latestProductTimeConfig = Number(latestProductTimeConfig);

    // validate
    for (const [k, v] of Object.entries(update)) {
      if (Number.isNaN(v) || v < 0) {
        const error = new Error(`${k} must be a non-negative number`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (Object.keys(update).length === 0) {
      return await System.findOne().exec();
    }

    const sys = await System.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async addSellerRequest(bidderId, dateEnd = null) {
    if (!bidderId) {
      const error = new Error("bidderId is required");
      error.statusCode = 400;
      throw error;
    }

    const request = {
      bidderId: mongoose.Types.ObjectId(bidderId),
    };
    if (dateEnd) request.dateEnd = dateEnd;

    const sys = await System.findOneAndUpdate(
      {},
      { $push: { sellerRequests: request } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async listSellerRequests(populate = false) {
    const sys = await System.findOne().exec();
    if (!sys) return [];
    if (!populate) return sys.sellerRequests;

    // populate user info for each request
    const ids = sys.sellerRequests.map((r) => r.bidderId);
    const users = await User.find({ _id: { $in: ids } })
      .select("-password -refreshToken -otp -otpExpires -__v")
      .exec();
    // map users by id for easy lookup
    const byId = users.reduce((acc, u) => {
      acc[u._id.toString()] = u;
      return acc;
    }, {});

    return sys.sellerRequests.map((r) => ({
      ...r.toObject(),
      user: byId[r.bidderId.toString()] || null,
    }));
  }

  static async approveSellerRequest(bidderId) {
    if (!bidderId) {
      const error = new Error("bidderId is required");
      error.statusCode = 400;
      throw error;
    }

    const sys = await System.findOne().exec();
    if (!sys) {
      const error = new Error("System config not found");
      error.statusCode = 500;
      throw error;
    }

    const idx = sys.sellerRequests.findIndex(
      (r) => r.bidderId && r.bidderId.toString() === bidderId.toString()
    );
    if (idx === -1) {
      const error = new Error("Seller request not found");
      error.statusCode = 404;
      throw error;
    }

    // remove the request
    sys.sellerRequests.splice(idx, 1);
    await sys.save();

    // give the user the Seller role (if not already)
    const user = await User.findById(bidderId).exec();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!Array.isArray(user.roles)) user.roles = [];
    if (!user.roles.includes(ROLES_LIST.Seller)) {
      user.roles.push(ROLES_LIST.Seller);
      await user.save();
    }

    return { system: sys, user };
  }

  // Categories management
  static async getCategories() {
    const sys = await System.findOne().exec();
    return sys ? sys.categories : [];
  }

  static async addCategory({
    categoryId = null,
    categoryName = "",
    subCategories = [],
  } = {}) {
    const cat = {
      categoryId: categoryId ? mongoose.Types.ObjectId(categoryId) : undefined,
      categoryName,
      subCategories: Array.isArray(subCategories)
        ? subCategories.map((s) => ({
            subCategoryId: s.subCategoryId
              ? mongoose.Types.ObjectId(s.subCategoryId)
              : undefined,
            subCategoryName: s.subCategoryName || "",
          }))
        : [],
    };

    // remove undefined fields to keep doc clean
    if (!cat.categoryId) delete cat.categoryId;

    const sys = await System.findOneAndUpdate(
      {},
      { $push: { categories: cat } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateCategory(categoryId, updateData = {}) {
    if (!categoryId) {
      const error = new Error("categoryId is required");
      error.statusCode = 400;
      throw error;
    }

    const sys = await System.findOne().exec();
    if (!sys) {
      const error = new Error("System config not found");
      error.statusCode = 500;
      throw error;
    }

    const cat = sys.categories.find(
      (c) => c.categoryId && c.categoryId.toString() === categoryId.toString()
    );
    if (!cat) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.categoryName !== undefined)
      cat.categoryName = updateData.categoryName;
    if (Array.isArray(updateData.subCategories)) {
      cat.subCategories = updateData.subCategories.map((s) => ({
        subCategoryId: s.subCategoryId
          ? mongoose.Types.ObjectId(s.subCategoryId)
          : undefined,
        subCategoryName: s.subCategoryName || "",
      }));
    }

    await sys.save();
    return sys;
  }

  static async removeCategory(categoryId) {
    if (!categoryId) {
      const error = new Error("categoryId is required");
      error.statusCode = 400;
      throw error;
    }

    const sys = await System.findOne().exec();
    if (!sys) return null;

    // find the category first
    const cat = sys.categories.find(
      (c) => c.categoryId && c.categoryId.toString() === categoryId.toString()
    );
    if (!cat) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }

    // ensure we have a categoryName to check against products
    const categoryName = (cat.categoryName || "").trim();
    if (!categoryName) {
      const error = new Error(
        "Cannot remove category without a categoryName. Please set categoryName first."
      );
      error.statusCode = 400;
      throw error;
    }

    // check if any product uses this category (products store category as string)
    const exists = await Product.exists({ "detail.category": categoryName });
    if (exists) {
      const error = new Error(
        "Cannot remove category: there are products assigned to this category."
      );
      error.statusCode = 400;
      throw error;
    }

    // safe to remove
    sys.categories = sys.categories.filter(
      (c) =>
        !(c.categoryId && c.categoryId.toString() === categoryId.toString())
    );

    await sys.save();
    return sys;
  }

  // Admin listing helpers
  static async listUsers({ page = 1, limit = 20, q = "" } = {}) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Number(limit) || 20);
    q = (q || "").trim();

    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ fullName: re }, { email: re }];
    }

    const total = await User.countDocuments(filter).exec();
    const users = await User.find(filter)
      .select(
        "-password -refreshToken -otp -otpExpires -resetPasswordToken -resetPasswordExpires -__v"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  }

  static async listProducts({ page = 1, limit = 20, q = "", status } = {}) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Number(limit) || 20);
    q = (q || "").trim();

    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [
        { "detail.name": re },
        { "detail.description": re },
        { "detail.category": re },
      ];
    }
    if (status !== undefined && status !== null && String(status).length)
      filter["auction.status"] = status;

    const total = await Product.countDocuments(filter).exec();
    const products = await Product.find(filter)
      .select("detail auction auctionHistory")
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("detail.sellerId", "fullName email")
      .lean()
      .exec();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: products,
    };
  }

  static async removeProduct(productId) {
    if (!productId) {
      const error = new Error("productId is required");
      error.statusCode = 400;
      throw error;
    }

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid productId");
      error.statusCode = 400;
      throw error;
    }

    const prod = await Product.findById(productId).exec();
    if (!prod) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }

    await Product.deleteOne({ _id: productId }).exec();
    return prod;
  }
}

module.exports = SystemService;
