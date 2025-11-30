const UserService = require("../services/UserService");

const getUserBasicProfile = async (req, res) => {
  try {
    const user = await UserService.getUserBasicInfoById(req.user);

    res.json(user);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    await UserService.updateUserInfo(req.user, req.body);

    res.json({ message: "Cập nhật thông tin người dùng thành công" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp mật khẩu cũ và mới." });
    }

    await UserService.updateUserPassword(
      req.user,
      currentPassword,
      newPassword
    );

    res.json({ message: "Cập nhật mật khẩu người dùng thành công" });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const userId = req.user;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const filter = req.query.filter || "all";

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const result = await UserService.getFeedBack(userId, {
      page,
      limit,
      filter,
    });

    return res.status(200).json(result);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const addToWatchList = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    const result = await UserService.addToWatchList(userId, productId);

    return res.status(200).json({
      message: result.message || "Thêm vào danh sách theo dõi thành công",
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const removeFromWatchList = async (req, res) => {
  try {
    const userId = req.user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Thiếu productId" });
    }

    const result = await UserService.removeFromWatchList(userId, productId);

    return res.status(200).json({
      message: result.message || "Đã xóa sản phẩm khỏi danh sách theo dõi",
    });
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getWatchList = async (req, res) => {
  try {
    const userId = req.user;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    const sort = req.query.sort || "newest";

    const result = await UserService.getWatchList(userId, {
      page,
      limit,
      sort,
    });

    return res.status(200).json(result);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getParticipatingAuctions = async (req, res) => {
  try {
    const userId = req.user;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;
    const filter = req.query.filter || "all";

    const result = await UserService.getParticipatingAuctions(userId, {
      page,
      limit,
      filter,
    });

    return res.status(200).json(result);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const userId = req.user;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 3;

    const result = await UserService.getMyProducts(userId, {
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (err) {
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error" });
  }
};

module.exports = {
  getUserBasicProfile,
  updateUserProfile,
  updateUserPassword,
  getFeedback,
  addToWatchList,
  removeFromWatchList,
  getWatchList,
  getParticipatingAuctions,
  getMyProducts,
};
