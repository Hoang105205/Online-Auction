const AuthService = require("../services/AuthService");
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

    const result = await AuthService.registerUser({
      email,
      password,
      fullName,
      address,
      roles: defaultRoles,
    });

    return res.status(200).json({
      message: "Mã xác thực (OTP) đã được gửi đến email của bạn.",
      email: result.email,
    });
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi máy chủ." });
  }
};

const verifySignup = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Dữ liệu không được để trống." });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Vui lòng nhập đủ thông tin." });
    }

    const result = await AuthService.verifySignupOTP(email, otp);

    return res.status(200).json(result);
  } catch (error) {
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Lỗi xác thực." });
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

    const foundUser = await AuthService.verifyCredentials(email, password);

    const accessToken = generateAccessToken(foundUser);
    const refreshToken = generateRefreshToken(foundUser);

    await AuthService.updateRefreshToken(foundUser._id, refreshToken);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return res.status(200).json({
      accessToken,
      id: foundUser._id,
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

    const foundUser = await AuthService.findUserByRefreshToken(refreshToken);

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
      id: foundUser._id,
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
    await AuthService.logoutUser(req.cookies.jwt);
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

    const user = await AuthService.loginWithGoogle(profile);

    const refreshToken = generateRefreshToken(user);

    await AuthService.updateRefreshToken(user._id, refreshToken);

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

    const result = await AuthService.forgotPassword(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// 4. Xác thực OTP Quên mật khẩu (Nhận Token)
const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Thiếu thông tin" });

    // Gọi hàm verifyForgotPasswordOTP bên Service
    const result = await AuthService.verifyForgotPasswordOTP(email, otp);
    
    // Trả về { message, resetToken }
    res.status(200).json(result); 
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

// 5. Đặt lại mật khẩu (Dùng Token)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body; 
    if (!token || !newPassword) return res.status(400).json({ message: "Thiếu thông tin" });

    const result = await AuthService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = {
  signup,
  login,
  refreshToken,
  logoutUser,
  loginGoogleCallback,
  verifySignup,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
};
