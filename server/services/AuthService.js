const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

class AuthService {
  static async registerUser(userData) {
    let user = await User.findOne({ email: userData.email }).exec();
    if (user) {
      // Nếu user đã tồn tại và đã verified
      if (user.isVerified) {
        const error = new Error("Email đã được đăng ký.");
        error.statusCode = 409;
        throw error;
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    if (user) {
      user.password = hashedPassword;
      user.fullName = userData.fullName;
      user.address = userData.address;
      user.otp = otp;
      user.otpExpires = otpExpires;
    } else {
      user = new User({
        ...userData,
        password: hashedPassword,
        otp: otp,
        otpExpires: otpExpires,
        isVerified: false,
      });
    }

    const subject = "Mã xác thực đăng ký Auctify";
    const htmlMessage = `
<div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#1f2937;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:28px 24px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
      <p style="margin:8px 0 0;font-size:13px;font-weight:500;color:#e0f2fe;letter-spacing:1px;text-transform:uppercase;">Đăng ký tài khoản</p>
    </div>

    <!-- Body -->
    <div style="padding:38px 40px 30px;">
      <p style="margin:0 0 18px;font-size:16px;font-weight:500;">Xin chào,</p>
      <p style="margin:0 0 20px;font-size:15px;color:#374151;">Cảm ơn bạn đã chọn <strong style="color:#0ea5e9;">Auctify</strong>. Vui lòng sử dụng mã OTP bên dưới để hoàn tất quá trình đăng ký. Mã có hiệu lực trong <strong>5 phút</strong>.</p>

      <div style="text-align:center;margin:30px 0 34px;">
        <div style="display:inline-block;background:#0ea5e9;color:#ffffff;font-weight:700;font-size:32px;letter-spacing:6px;padding:18px 34px;border-radius:12px;font-family:'Roboto',Helvetica,Arial,sans-serif;box-shadow:0 4px 10px rgba(14,165,233,0.35);">
          ${otp}
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Không chia sẻ mã này với bất kỳ ai.</p>
      </div>

      <div style="background:#f0f9ff;border:1px solid #bae6fd;padding:16px 18px;border-radius:10px;font-size:13px;color:#0369a1;line-height:1.5;">
        Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email. Tài khoản sẽ không được kích hoạt nếu bạn không xác thực.
      </div>

      <p style="margin:34px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
      <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Auctify Team</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">Bạn gặp vấn đề? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#0ea5e9;text-decoration:none;font-weight:600;">auctify.onlineauction@gmail.com</a></p>
      <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
    </div>
  </div>
</div>
`;

    // Gửi mail bất đồng bộ
    sendEmail(userData.email, subject, htmlMessage).catch(console.error);

    await user.save();

    return { email: user.email };
  }

  static async verifySignupOTP(email, otp) {
    const user = await User.findOne({ email }).exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    if (user.isVerified) {
      return { message: "Tài khoản đã được xác minh trước đó." };
    }

    if (!user.otp || user.otp !== otp) {
      const error = new Error("Mã OTP không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    if (user.otpExpires < Date.now()) {
      const error = new Error("Mã OTP đã hết hạn. Vui lòng đăng ký lại.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: "Xác thực thành công." };
  }

  static async verifyCredentials(email, password) {
    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      const error = new Error("Không tìm thấy người dùng.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    if (!foundUser.isVerified) {
      const error = new Error("Tài khoản chưa được xác minh.");
      error.statusCode = 403; // Forbidden
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
        user.isVerified = true; // Đã xác minh qua Google
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
      isVerified: true, // Đã xác minh qua Google
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

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("Email không tồn tại trong hệ thống.");
      error.statusCode = 404;
      throw error;
    }

    // Tái sử dụng: Logic sinh OTP 6 số
    const otp = crypto.randomInt(100000, 999999).toString();

    // Tái sử dụng trường OTP trong DB (Ghi đè OTP cũ nếu có)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // Gửi Email OTP (Blue, security-focused template)
    const message = `
<div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 6px 16px rgba(0,0,0,0.07);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:26px 24px;text-align:center;">
      <h1 style="margin:0;font-size:26px;font-weight:800;letter-spacing:.3px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
      <p style="margin:8px 0 0;font-size:13px;font-weight:600;color:#e0f2fe;letter-spacing:.8px;text-transform:uppercase;">Xác thực đặt lại mật khẩu</p>
    </div>

    <!-- Body -->
    <div style="padding:34px 36px 28px;">
      <p style="margin:0 0 14px;font-size:16px;font-weight:600;">🔐 Xin chào,</p>
      <p style="margin:0 0 18px;font-size:15px;color:#334155;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng sử dụng mã OTP bên dưới để xác thực yêu cầu. Mã có hiệu lực trong <strong>10 phút</strong>.</p>

      <div style="text-align:center;margin:26px 0 30px;">
        <div style="display:inline-block;background:#0ea5e9;color:#ffffff;font-weight:800;font-size:32px;letter-spacing:6px;padding:16px 30px;border-radius:12px;font-family:'Roboto',Helvetica,Arial,sans-serif;box-shadow:0 4px 12px rgba(14,165,233,.35);">
          ${otp}
        </div>
        <p style="margin:12px 0 0;font-size:12px;color:#64748b;">Không chia sẻ mã này với bất kỳ ai.</p>
      </div>

      <div style="background:#eff6ff;border:1px solid #bae6fd;padding:14px 16px;border-radius:10px;font-size:13px;color:#0c4a6e;line-height:1.6;">
        Lưu ý bảo mật: Nếu bạn không thực hiện yêu cầu này, có thể ai đó đã cố truy cập tài khoản của bạn. Vui lòng bỏ qua email hoặc đổi mật khẩu ngay sau khi đăng nhập.
      </div>

      <p style="margin:24px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
      <p style="margin:0;font-size:13px;font-weight:700;color:#0f172a;">Auctify Team</p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:16px 22px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">Cần hỗ trợ? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#0ea5e9;text-decoration:none;font-weight:700;">auctify.onlineauction@gmail.com</a></p>
      <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
    </div>
  </div>
</div>`;

    // Tái sử dụng hàm sendEmail
    try {
      await sendEmail(email, "Mã xác thực đặt lại mật khẩu - Auctify", message);
      return { message: "Mã OTP đã được gửi đến email của bạn." };
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }

  static async verifyForgotPasswordOTP(email, otp) {
    const user = await User.findOne({
      email,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error("Mã OTP không đúng hoặc đã hết hạn.");
      error.statusCode = 400;
      throw error;
    }

    // Tạo "Vé thông hành" (Reset Token)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token để lưu vào DB (Bảo mật)
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút

    // Xóa OTP ngay lập tức
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Trả về token chưa hash cho Client
    return { message: "Xác thực thành công.", resetToken: resetToken };
  }

  static async resetPassword(token, newPassword) {
    // Hash token từ client gửi lên để so sánh với DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error(
        "Phiên đổi mật khẩu không hợp lệ hoặc đã hết hạn."
      );
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;

    // Dọn dẹp token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." };
  }
}

module.exports = AuthService;
