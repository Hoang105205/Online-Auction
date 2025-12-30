const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const {
  signup,
  login,
  refreshToken,
  logoutUser,
  loginGoogleCallback,
  verifySignup,
  forgotPassword,
  verifyForgotPasswordOtp,
  resetPassword,
} = require("../controllers/AuthController");

router.post("/signup", signup);

router.post("/login", login);

router.get("/refresh-token", refreshToken);

router.get("/logout", logoutUser);

// Route 1: Gọi Google Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Route 2: Xử lý callback từ Google sau khi người dùng đăng nhập thành công
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  loginGoogleCallback
);

router.post("/verify-otp", verifySignup);

router.post("/forgot-password", forgotPassword);

router.post("/verify-forgot-password-otp", verifyForgotPasswordOtp);

router.post("/reset-password", resetPassword);

module.exports = router;
