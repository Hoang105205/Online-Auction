const UserService = require("../services/UserService");
const ROLES_LIST = require("../config/roles_list");
const axios = require("axios");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/tokenUtils");
const signup = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ message: "Dữ liệu không được để trống." });
      return;
    }

    const { email, password, fullName, address, recaptchaToken } = req.body;

    if (!email || !password || !fullName || !address) {
      res.status(400).json({ message: "Tất cả các trường là bắt buộc." });
      return;
    }

    if (!recaptchaToken) {
      res.status(400).json({ message: "Vui lòng xác thực reCAPTCHA." });
      return;
    }

    try {
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

      const params = new URLSearchParams();
      params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
      params.append("response", recaptchaToken);

      const googleResponse = await axios.post(verifyUrl, params);

      const { success } = googleResponse.data;

      if (!success) {
        return res.status(400).json({ message: "Xác thực Captcha thất bại." });
      }
    } catch (captchaError) {
      console.error("Lỗi kết nối Google ReCaptcha:", captchaError);
      return res
        .status(500)
        .json({ message: "Lỗi xác thực Captcha từ phía Server." });
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

    const foundUser = await UserService.verifyCredentials(email, password);

    const accessToken = generateAccessToken(foundUser);
    const refreshToken = generateRefreshToken(foundUser);

    await UserService.updateRefreshToken(foundUser._id, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(200).json({
      accessToken,
      email: foundUser.email,
      fullName: foundUser.fullName,
      roles: foundUser.roles,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

const refreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    const foundUser = await UserService.findUserByRefreshToken(refreshToken);

    try {
      verifyRefreshToken(refreshToken); // Nếu lỗi sẽ nhảy xuống catch
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Token hết hạn hoặc không hợp lệ" });
    }

    const accessToken = generateAccessToken(foundUser);

    return res.status(200).json({
      accessToken,
      email: foundUser.email,
      fullName: foundUser.fullName,
      roles: foundUser.roles,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

const logoutUser = async (req, res) => {
  if (!req.cookies?.jwt) {
    return res.sendStatus(204); // No content
  }

  try {
    await UserService.logoutUser(req.cookies.jwt);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  } finally {
    res.clearCookie("jwt", { httpOnly: true, secure: true, sameSite: "None" });
    return res.sendStatus(204);
  }
};

const loginGoogleCallback = async (req, res) => {
  try {
    const profile = req.user;

    if (!profile) {
      throw new Error("Không nhận được thông tin người dùng từ Google.");
    }

    const user = await UserService.loginWithGoogle(profile);

    const refreshToken = generateRefreshToken(user);

    await UserService.updateRefreshToken(user._id, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    res.redirect(`${clientUrl}/login-success`);
  } catch (error) {
    console.error("Google Login Error:", error);
    // Nếu lỗi, chuyển hướng về trang login của Client kèm thông báo lỗi
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/login?error=google_failed`);
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logoutUser,
  loginGoogleCallback,
};
