const SystemService = require("../services/SystemService");

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

module.exports = {
  getSystemConfig,
  updateSystemConfig,
  updateAutoExtendBefore,
  updateAutoExtendDuration,
  updateLatestProductTimeConfig,
  updateTimeConfigs,
  listSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
  listUsers,
  listProducts,
  removeProduct,
  getCategoryBySlug,
};
