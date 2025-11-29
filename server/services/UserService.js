const User = require("../models/User");
const Product = require("../models/Product");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const ROLES_LIST = require("../config/roles_list");

class UserService {
  static async checkAndDemoteSeller(user) {
    if (
      !user.roles.includes(ROLES_LIST.Seller) ||
      !user.sellerRequest.startDate
    ) {
      return user;
    }

    const expiryDate = new Date(user.sellerRequest.startDate);
    expiryDate.setDate(expiryDate.getDate() + 7); // Seller role valid for 7 days

    if (new Date() > expiryDate) {
      user.roles = user.roles.filter((role) => role !== ROLES_LIST.Seller);

      user.sellerRequest = {
        status: "none",
        startDate: null,
      };

      await user.save();
    }

    return user;
  }

  static async getUserBasicInfoById(userId) {
    if (!userId) {
      const error = new Error("ID người dùng không được để trống.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    let user = await User.findById(userId)
      .select(
        "-password -refreshToken -otp -otpExpires -feedBackAsBidder -feedBackAsSeller -isVerified -__v -googleId -createdAt -updatedAt"
      )
      .exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    user = await this.checkAndDemoteSeller(user);

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

  static async getFeedBack(userId, { page = 1, limit = 5, filter = "all" }) {
    const user = await User.findById(userId)
      .select("feedBackAsBidder feedBackAsSeller")
      .populate({
        path: "feedBackAsBidder.commenterId",
        select: "fullName",
      })
      .populate({
        path: "feedBackAsSeller.commenterId",
        select: "fullName",
      })
      .exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    let rawFeedbacks = [];

    // Map dữ liệu Bidder (Người này đi mua và được đánh giá)
    const bidderReviews = user.feedBackAsBidder.map((item) => ({
      _id: item._id,
      content: item.content,
      isGood: item.isGood,
      date: item.date,
      commenter: item.commenterId?.fullName || "Người dùng ẩn",
      role: "bidder",
    }));

    // Map dữ liệu Seller (Người này đi bán và được đánh giá)
    const sellerReviews = user.feedBackAsSeller.map((item) => ({
      _id: item._id,
      content: item.content,
      isGood: item.isGood,
      date: item.date,
      commenter: item.commenterId?.fullName || "Người dùng ẩn",
      role: "seller",
    }));

    if (filter === "bidder") {
      rawFeedbacks = bidderReviews;
    } else if (filter === "seller") {
      rawFeedbacks = sellerReviews;
    } else {
      rawFeedbacks = [...bidderReviews, ...sellerReviews];
    }

    // stats
    const totalCount = rawFeedbacks.length;
    const goodCount = rawFeedbacks.filter((fb) => fb.isGood).length;
    const badCount = totalCount - goodCount;

    const percentage =
      totalCount === 0 ? 100 : Math.round((goodCount / totalCount) * 100);

    rawFeedbacks.sort((a, b) => new Date(b.date) - new Date(a.date));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFeedbacks = rawFeedbacks.slice(startIndex, endIndex);

    return {
      feedbacks: paginatedFeedbacks,
      stats: {
        total: totalCount,
        good: goodCount,
        bad: badCount,
        percentage: percentage,
      },
      pagination: {
        currentPage: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  static async addToWatchList(userId, productId) {
    const product = await Product.findById(productId).exec();
    if (!product) {
      const error = new Error("Sản phẩm không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    const result = await User.updateOne(
      { _id: userId },
      { $addToSet: { watchList: productId } }
    ).exec();

    // 3. Kiểm tra xem User có tồn tại không
    // matchedCount = 0 nghĩa là không tìm thấy user nào có ID đó
    if (result.matchedCount === 0) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    // 4. Kiểm tra xem có thay đổi dữ liệu không (modifiedCount)
    if (result.modifiedCount === 0) {
      // Nếu = 0 nghĩa là productId đã có sẵn trong watchList
      return { message: "Sản phẩm này đã có trong danh sách theo dõi rồi." };
    }

    return { message: "Đã thêm vào danh sách theo dõi thành công." };
  }

  static async removeFromWatchList(userId, productId) {
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { watchList: productId } } // $pull: Kéo (xóa) phần tử ra khỏi mảng
    ).exec();

    if (result.matchedCount === 0) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    if (result.modifiedCount === 0) {
      return { message: "Sản phẩm không có trong danh sách theo dõi." };
    }

    return { message: "Đã xóa sản phẩm khỏi danh sách theo dõi." };
  }
}

module.exports = UserService;
