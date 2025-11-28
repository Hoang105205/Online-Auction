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

module.exports = { getUserBasicProfile, updateUserProfile, updateUserPassword };
