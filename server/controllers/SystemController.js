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

const updateAutoExtend = async (req, res) => {
  try {
    const { autoExtendBefore, autoExtendDuration } = req.body || {};

    const sys = await SystemService.updateAutoExtend(
      autoExtendBefore,
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

// Seller request endpoints
const addSellerRequest = async (req, res) => {
  try {
    // bidderId may come from authenticated user (req.user) or body.bidderId (admin)
    const bidderId = req.user || req.body?.bidderId;
    const { dateEnd } = req.body || {};
    if (!bidderId)
      return res.status(400).json({ message: "bidderId không được để trống." });

    const sys = await SystemService.addSellerRequest(bidderId, dateEnd);
    return res.status(200).json(sys);
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const listSellerRequests = async (req, res) => {
  try {
    const populate =
      req.query?.populate === "true" || req.query?.populate === "1";
    const list = await SystemService.listSellerRequests(populate);
    return res.status(200).json(list);
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
    return res.status(200).json({ message: "Phê duyệt thành công.", result });
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

    const sys = await SystemService.rejectSellerRequest(bidderId);
    return res
      .status(200)
      .json({ message: "Từ chối yêu cầu thành công.", system: sys });
  } catch (err) {
    return res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

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

module.exports = {
  getSystemConfig,
  updateSystemConfig,
  updateAutoExtend,
  updateLatestProductTimeConfig,
  updateTimeConfigs,
  addSellerRequest,
  listSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
};
