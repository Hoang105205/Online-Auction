const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

class UserService {
  static async registerUser(userData) {
    const existingUser = await User.findOne({ email: userData.email }).exec();
    if (existingUser) {
      const error = new Error("Email đã được đăng ký.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    const newUser = new User({ ...userData, password: hashedPassword });
    const user = await newUser.save();

    const userDto = user.toObject();

    // Loại bỏ các trường nhạy cảm trước khi trả về
    delete userDto.password;
    delete userDto.refreshToken;

    return userDto;
  }

  static async verifyCredentials(email, password) {
    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      const error = new Error("Không tìm thấy người dùng.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (!match) {
      const error = new Error("Sai tên đăng nhập hoặc mật khẩu.");
      error.statusCode = 401;
      throw error;
    }

    return foundUser;
  }

  static async updateRefreshToken(userId, refreshToken) {
    await User.findByIdAndUpdate(userId, { refreshToken });
  }

  static async findUserByRefreshToken(refreshToken) {
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      const error = new Error("Refresh token không hợp lệ.");
      error.statusCode = 403;
      throw error;
    }
    return foundUser;
  }

  static async logoutUser(refreshToken) {
    if (!refreshToken) return;
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
  }

  // --- HÀM MỚI: Xử lý Login Google ---
  static async loginWithGoogle(profile) {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    const fullName = profile.displayName;

    // 1. Tìm xem user đã tồn tại chưa
    let user = await User.findOne({ email: email }).exec();

    if (user) {
      // CASE A: ĐÃ CÓ TÀI KHOẢN
      // Cập nhật googleId nếu chưa có (để lần sau nhận diện nhanh hơn)
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
      return user;
    }

    // CASE B: NGƯỜI DÙNG MỚI (Chưa từng tồn tại)
    // 2. Tạo mật khẩu ngẫu nhiên (8 ký tự hex = 16 ký tự thường)
    const randomPassword = crypto.randomBytes(8).toString("hex");

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);

    // 4. Tạo User mới
    const newUser = new User({
      email: email,
      password: hashedPassword, // Password ngẫu nhiên
      fullName: fullName,
      googleId: googleId,
      roles: [2001], // Mặc định là Bidder
      // address: Sẽ null, chờ user cập nhật
    });

    // 5. Tạo nội dung Email HTML đẹp mắt
    const subject =
      "Chào mừng đến với Auctify - 🔐 Thông tin đăng nhập Auctify của bạn";

    // Sử dụng HTML Inline CSS để đảm bảo hiển thị tốt trên mọi trình duyệt mail
    const htmlMessage = `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    
    <div style="background-color: #3b82f6; padding: 30px 0; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Auctify</h1>
    </div>

    <div style="padding: 40px 30px; text-align: center;">
      <h2 style="color: #333333; font-size: 20px; margin-bottom: 20px;">Xin chào ${fullName},</h2>
      
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
        Chào mừng bạn đến với Auctify! Tài khoản của bạn đã được tạo thành công thông qua liên kết Google.
      </p>

      <p style="color: #666666; font-size: 16px; margin-bottom: 15px;">
        Dưới đây là mật khẩu mặc định để bạn có thể đăng nhập trực tiếp lần sau (không cần qua Google):
      </p>

      <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 6px; padding: 20px; margin: 30px 0;">
        <span style="display: block; font-size: 14px; color: #64748b; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px;">Mật khẩu của bạn</span>
        <span style="display: block; font-size: 28px; font-family: monospace; font-weight: bold; color: #1e40af; letter-spacing: 2px;">${randomPassword}</span>
      </div>

      <p style="color: #ef4444; font-size: 14px; font-style: italic; margin-top: 30px;">
        ⚠️ Vì lý do bảo mật, vui lòng đổi mật khẩu này ngay sau khi đăng nhập lần đầu tiên.
      </p>
    </div>

    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        Nếu bạn có câu hỏi, vui lòng liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color: #3b82f6; text-decoration: none;">auctify.onlineauction@gmail.com</a>
      </p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
        © 2025 Auctify Team. All rights reserved.
      </p>
    </div>
  </div>
</div>
`;

    // Gửi mail
    sendEmail(email, subject, htmlMessage);

    // 6. Lưu vào DB
    await newUser.save();

    return newUser;
  }
}

module.exports = UserService;
