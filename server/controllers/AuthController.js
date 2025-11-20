const UserService = require("../services/UserService");
const ROLES_LIST = require("../config/roles_list");

const signup = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Dữ liệu không được để trống." });
      return;
    }

    const { email, password, fullName, address } = req.body;

    if (!email || !password || !fullName || !address) {
      res.status(400).json({ message: "Tất cả các trường là bắt buộc." });
      return;
    }

    const defaultRoles = [ROLES_LIST.Bidder];

    const newUser = await UserService.registerUser({
      email,
      password,
      fullName,
      address,
      roles: defaultRoles,
    });

    return res.status(201).json({
      message: "Đăng ký thành công!",
      user: newUser,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Dữ liệu không được để trống." });
      return;
    }

    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email và mật khẩu là bắt buộc." });
      return;
    }

    const { accessToken, refreshToken } = await UserService.loginUser(
      email,
      password
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

module.exports = { signup, login };
