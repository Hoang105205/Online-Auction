const SystemService = require("../services/SystemService");
const mongoose = require("mongoose");
const User = require("../models/User");

const getSystemConfig = async (req, res) => {
  try {
    const sys = await SystemService.getConfig();
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getTimeConfigs = async (req, res) => {
  try {
    const sys = await SystemService.getTimeConfigs();
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateSystemConfig = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ message: "Dữ liệu cập nhật không được để trống." });
    }

    const sys = await SystemService.updateConfig(req.body);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateAutoExtendBefore = async (req, res) => {
  try {
    const { autoExtendBefore } = req.body || {};

    const sys = await SystemService.updateAutoExtendBefore(autoExtendBefore);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};
const updateAutoExtendDuration = async (req, res) => {
  try {
    const { autoExtendDuration } = req.body || {};

    const sys = await SystemService.updateAutoExtendDuration(
      autoExtendDuration
    );
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};
const updateLatestProductTimeConfig = async (req, res) => {
  try {
    const { latestProductTimeConfig } = req.body || {};
    if (latestProductTimeConfig === undefined) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp latestProductTimeConfig." });
    }

    const sys = await SystemService.updateLatestProductTimeConfig(
      latestProductTimeConfig
    );
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateTimeConfigs = async (req, res) => {
  try {
    const payload = req.body || {};
    const sys = await SystemService.updateTimeConfigs(payload);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

// ===== Hoang =====
const listSellerRequests = async (req, res) => {
  try {
    const page = req.query?.page ? parseInt(req.query.page) : 1;
    const limit = req.query?.limit ? parseInt(req.query.limit) : 6;
    const sortBy = req.query?.sortBy || "date";

    const result = await SystemService.getSellerRequests({
      page,
      limit,
      sortBy,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const approveSellerRequest = async (req, res) => {
  try {
    const { bidderId } = req.params;
    if (!bidderId)
      return res.status(400).json({ message: "bidderId không được để trống." });

    const result = await SystemService.approveSellerRequest(bidderId);
    return res
      .status(200)
      .json({ message: result.message || "Phê duyệt thành công." });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const rejectSellerRequest = async (req, res) => {
  try {
    const { bidderId } = req.params;
    if (!bidderId)
      return res.status(400).json({ message: "bidderId không được để trống." });

    const result = await SystemService.rejectSellerRequest(bidderId);
    return res
      .status(200)
      .json({ message: result.message || "Từ chối yêu cầu thành công." });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};
// ===== Hoang =====

// Categories

// ===== Duc =====
const getCategoriesAdmin = async (req, res) => {
  try {
    const params = req.query || {};
    const cats = await SystemService.getCategoriesAdmin(params);
    return res.status(200).json(cats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

// ===== Huy =====
// Categories
const getCategories = async (req, res) => {
  try {
    const cats = await SystemService.getCategories();
    return res.status(200).json(cats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const addCategory = async (req, res) => {
  try {
    if (!req.body)
      return res.status(400).json({ message: "Dữ liệu không được để trống." });
    const sys = await SystemService.addCategory(req.body);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId)
      return res
        .status(400)
        .json({ message: "categoryId không được để trống." });
    if (!req.body)
      return res.status(400).json({ message: "Dữ liệu không được để trống." });

    const sys = await SystemService.updateCategory(categoryId, req.body);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const removeCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!categoryId)
      return res
        .status(400)
        .json({ message: "categoryId không được để trống." });

    const sys = await SystemService.removeCategory(categoryId);
    return res
      .status(200)
      .json({ message: "Xoá category thành công.", system: sys });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const listUsers = async (req, res) => {
  try {
    const result = await SystemService.listUsers(req.query || {});
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const listProducts = async (req, res) => {
  try {
    const result = await SystemService.listProducts(req.query || {});
    return res.status(200).json(result);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res
        .status(400)
        .json({ message: "productId không được để trống." });

    const deleted = await SystemService.removeProduct(productId);
    return res
      .status(200)
      .json({ message: "Xóa sản phẩm thành công.", product: deleted });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

// =====Huy=======
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await SystemService.getCategoryBySlug(slug);
    return res.json(category);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

const removeSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    if (!categoryId)
      return res
        .status(400)
        .json({ message: "categoryId không được để trống." });
    if (!subCategoryId)
      return res
        .status(400)
        .json({ message: "subCategoryId không được để trống." });

    const sys = await SystemService.removeSubCategory(
      categoryId,
      subCategoryId
    );
    return res
      .status(200)
      .json({ message: "Xoá subcategory thành công.", system: sys });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = await SystemService.getDashboardStats();
    return res.status(200).json(stats);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const removeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params || {};
    if (!userId)
      return res.status(400).json({ message: "userId không được để trống." });

    const session = await mongoose.startSession();
    let cleanupResult = {};
    try {
      await session.withTransaction(async () => {
        // Step 1: cleanup auction activity related to this user
        cleanupResult = await SystemService.cleanupUserAuctionActivity(
          userId,
          session
        );

        // Step 2: delete the user
        await User.findByIdAndDelete(userId).session(session);
      });
    } finally {
      session.endSession();
    }

    console.log(`✅ User ${userId} deleted successfully. Cleanup result:`, {
      productsDeleted: cleanupResult.prodIds?.length || 0,
      cloudinaryFoldersDeleted:
        cleanupResult.cloudinaryFoldersDeleted?.length || 0,
    });

    return res.status(200).json({
      message: "Xóa người dùng thành công.",
      cleanup: {
        productsDeleted: cleanupResult.prodIds?.length || 0,
        cloudinaryFoldersDeleted:
          cleanupResult.cloudinaryFoldersDeleted?.length || 0,
      },
    });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  getSystemConfig,
  getTimeConfigs,
  updateSystemConfig,
  updateAutoExtendBefore,
  updateAutoExtendDuration,
  updateLatestProductTimeConfig,
  updateTimeConfigs,
  listSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getCategories,
  getCategoriesAdmin,
  addCategory,
  updateCategory,
  removeCategory,
  removeUserAdmin,
  getDashboardStats,
  removeSubCategory,
  listUsers,
  listProducts,
  removeProduct,
  getCategoryBySlug,
};
