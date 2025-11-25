const User = require("../models/User");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

class UserService {
  static async getUserBasicInfoById(userId) {
    if (!userId) {
      const error = new Error("ID người dùng không được để trống.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const user = await User.findById(userId)
      .select("-password -refreshToken -otp -otpExpires -feedBackAsBidder -feedBackAsSeller -isVerified -__v -googleId -createdAt -updatedAt")
      .exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    return user;
  }


  static async updateUserInfo(userId, updateData) {
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      }).exec();

      if (existingUser) {
        const error = new Error("Email đã được sử dụng bởi người dùng khác.");
        error.statusCode = 409; // Conflict
        throw error;
      }
    }

    const result = await User.findByIdAndUpdate(userId, {
      $set: {
        fullName: updateData.fullName,
        email: updateData.email,
        address: updateData.address,
      },
    }).exec();

    if (!result) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    return;
  }

  static async updateUserPassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      const error = new Error("Mật khẩu hiện tại không đúng.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    user.password = hashedPassword;
    await user.save();

    return;
  }
}

module.exports = UserService;
