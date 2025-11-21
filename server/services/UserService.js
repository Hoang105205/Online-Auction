const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SALT_ROUNDS = process.env.SALT_ROUNDS;

class UserService {
  static async registerUser(userData) {
    const existingUser = await User.findOne({ email: userData.email }).exec();
    if (existingUser) {
      const error = new Error("Email đã được đăng ký.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(
      userData.password,
      parseInt(SALT_ROUNDS)
    );

    const newUser = new User({ ...userData, password: hashedPassword });
    const user = await newUser.save();

    const userDto = user.toObject();

    // Loại bỏ các trường nhạy cảm trước khi trả về
    delete userDto.password;
    delete userDto.refreshToken;

    return userDto;
  }

  static async loginUser(email, password) {
    const foundUser = await User.findOne({ email }).exec();

    if (!foundUser) {
      const error = new Error("Không tìm thấy người dùng.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const match = await bcrypt.compare(password, foundUser.password);

    if (match) {
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
            email: foundUser.email,
            fullname: foundUser.fullName,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { email: foundUser.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      foundUser.refreshToken = refreshToken;
      await foundUser.save();

      return {
        accessToken,
        refreshToken,
        email: foundUser.email,
        fullName: foundUser.fullName,
        roles: foundUser.roles,
      };
    } else {
      const error = new Error("Sai tên đăng nhập hoặc mật khẩu.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }
  }

  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error("Refresh token không được cung cấp.");
      error.statusCode = 401; // Unauthorized
      throw error;
    }

    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
      const error = new Error("Refresh token không hợp lệ.");
      error.statusCode = 403; // Forbidden
      throw error;
    }

    try {
      const accessToken = jwt.sign(
        {
          UserInfo: {
            id: foundUser._id,
            email: foundUser.email,
            fullname: foundUser.fullName,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      return {
        accessToken,
        email: foundUser.email,
        fullName: foundUser.fullName,
        roles: foundUser.roles,
      };
    } catch (err) {
      const error = new Error("Refresh token không hợp lệ.");
      error.statusCode = 403; // Forbidden
      throw error;
    }
  }

  static async logoutUser(refreshToken) {
    if (!refreshToken) return;

    const foundUser = await User.findOne({ refreshToken }).exec();

    if (foundUser) {
      foundUser.refreshToken = null;
      await foundUser.save();
    }

    return;
  }
}

module.exports = UserService;
