const User = require("../models/User");
const Product = require("../models/Product");
const SystemSetting = require("../models/System");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const ROLES_LIST = require("../config/roles_list");
const { calculateUserRating } = require("../utils/userUtils");

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

    const updateFields = {
      fullName: updateData.fullName,
      email: updateData.email,
      address: updateData.address,
      dateOfBirth: updateData.dateOfBirth, // <--- THÊM DÒNG NÀY
    };

    // Loại bỏ các trường undefined (tránh việc update đè giá trị null vào DB nếu client không gửi lên)
    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    const result = await User.findByIdAndUpdate(
      userId,
      {
        $set: updateFields,
      },
      { new: true }
    ).exec();

    if (!result) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 400; // Bad Request
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
      .select("feedBackAsBidder feedBackAsSeller fullName email")
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
      user: {
        fullName: user.fullName,
        email: user.email,
      },
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

    if (product.detail.sellerId.toString() === userId) {
      const error = new Error(
        "Bạn không thể thêm sản phẩm của chính mình vào danh sách theo dõi."
      );
      error.statusCode = 400;
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

  static async getWatchList(userId, { page = 1, limit = 3, sort = "newest" }) {
    let sortOption = {};

    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      case "price_desc": // Giá cao xuống thấp
        sortOption = { "auction.currentPrice": -1 };
        break;
      case "price_asc": // Giá thấp lên cao
        sortOption = { "auction.currentPrice": 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const userCount = await User.findById(userId).select("watchList").exec();
    if (!userCount) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    const totalCountFromDB = userCount.watchList.length;

    const user = await User.findById(userId)
      .select("watchList")
      .populate({
        path: "watchList",
        select:
          "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.endTime auction.bidders auction.status auction.highestBidderId createdAt",
        options: {
          sort: sortOption,
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
        populate: {
          path: "auction.highestBidderId",
          select: "fullName",
        },
      })
      .exec();

    const validProducts = user.watchList.filter((p) => p !== null);

    return {
      products: validProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCountFromDB / limit),
        totalItems: totalCountFromDB,
        limit: parseInt(limit),
      },
    };
  }

  static async getParticipatingAuctions(
    userId,
    { page = 1, limit = 3, filter = "all" }
  ) {
    const now = new Date();

    let matchOptions = {};

    switch (filter) {
      case "active":
        matchOptions = {
          "auction.endTime": { $gt: now },
        };
        break;

      case "ending_soon":
        const threeDaysLater = new Date(
          now.getTime() + 3 * 24 * 60 * 60 * 1000
        );
        matchOptions = {
          "auction.endTime": { $gt: now, $lte: threeDaysLater },
        };
        break;

      case "all":
      default:
        matchOptions = {};
        break;
    }

    const userForCount = await User.findById(userId)
      .select("auctionsParticipated")
      .populate({
        path: "auctionsParticipated",
        match: matchOptions,
        select: "_id",
      })
      .exec();

    if (!userForCount) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404;
      throw error;
    }

    const validCountList = userForCount.auctionsParticipated.filter(
      (p) => p !== null
    );
    const totalItems = validCountList.length;

    const user = await User.findById(userId)
      .select("auctionsParticipated")
      .populate({
        path: "auctionsParticipated",
        match: matchOptions,
        select:
          "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.endTime auction.bidders auction.status auction.highestBidderId createdAt",
        options: {
          sort: { "auction.endTime": 1 },
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
        populate: {
          path: "auction.highestBidderId",
          select: "fullName",
        },
      })
      .exec();

    const products = user.auctionsParticipated.filter((p) => p !== null);

    return {
      products: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        limit: parseInt(limit),
      },
    };
  }

  static async getMyProducts(userId, { page = 1, limit = 3 }) {
    const query = {
      "detail.sellerId": userId,
      "auction.status": "active",
    };

    const totalItems = await Product.countDocuments(query).exec();

    const products = await Product.find(query)
      .select(
        "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.endTime auction.bidders auction.status auction.highestBidderId createdAt"
      )
      .populate({
        path: "auction.highestBidderId",
        select: "fullName",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    return {
      products: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        limit: parseInt(limit),
      },
    };
  }

  static async requestSellerUpgrade(userId) {
    const user = await User.findById(userId).exec();

    if (!user) {
      const error = new Error("Người dùng không tồn tại.");
      error.statusCode = 404; // Not Found
      throw error;
    }

    if (user.roles.includes(ROLES_LIST.Seller)) {
      const error = new Error("Bạn đã là người bán hàng.");
      error.statusCode = 400; // Bad Request
      throw error;
    }

    if (user.sellerRequest.status === "pending") {
      const error = new Error("Yêu cầu nâng cấp của bạn đang chờ xử lý.");
      error.statusCode = 400;
      throw error;
    }

    user.sellerRequest.status = "pending";
    user.sellerRequest.startDate = null;
    await user.save();

    await SystemSetting.findOneAndUpdate(
      {},
      {
        $push: {
          sellerRequests: {
            bidderId: userId,
            dateStart: new Date(),
          },
        },
        // Đảm bảo các field khác không bị null nếu tạo mới (optional)
        $setOnInsert: { autoExtendBefore: 0, autoExtendDuration: 0 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).exec();

    return { message: "Gửi yêu cầu thành công. Vui lòng chờ Admin duyệt." };
  }

  static async getWonProducts(userId, { page = 1, limit = 3 }) {
    try {
      const skip = (page - 1) * limit;

      // Điều kiện Query
      const query = {
        "auction.highestBidderId": userId,
        "auction.status": { $ne: "active" }, // Lấy tất cả status: pending, ended, cancelled
      };

      // 1. Đếm tổng số lượng (để phân trang)
      const totalCount = await Product.countDocuments(query);

      // 2. Lấy dữ liệu
      let products = await Product.find(query)
        .select(
          "detail.name detail.images detail.sellerId auction.currentPrice auction.status auction.bidders updatedAt"
        ) // Chỉ lấy field cần thiết
        .sort({ updatedAt: -1 }) // Mặc định sort theo thời gian cập nhật mới nhất (lúc chuyển status)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "detail.sellerId",
          select: "fullName",
        })
        .lean() // Tăng tốc độ query vì chỉ cần đọc
        .exec();

      products = await Promise.all(
        products.map(async (product) => {
          const sellerId = product.detail.sellerId?._id;

          if (sellerId) {
            const ratingStats = await calculateUserRating(sellerId.toString());

            product.detail.sellerId.rating = ratingStats.percentage;
          }

          return product;
        })
      );

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getSoldProducts(userId, { page = 1, limit = 3 }) {
    try {
      const skip = (page - 1) * limit;

      const query = {
        "detail.sellerId": userId,
        "auction.status": { $ne: "active" },
      };

      // 2. Đếm tổng
      const totalCount = await Product.countDocuments(query);

      // 3. Lấy dữ liệu
      let products = await Product.find(query)
        .select(
          "detail.name detail.images auction.currentPrice auction.status auction.bidders auction.highestBidderId updatedAt"
        )
        .sort({ updatedAt: -1 }) // Mới nhất lên đầu
        .skip(skip)
        .limit(limit)
        .populate({
          path: "auction.highestBidderId",
          select: "fullName",
        })
        .lean()
        .exec();

      products = await Promise.all(
        products.map(async (product) => {
          const winner = product.auction.highestBidderId;

          // Chỉ tính nếu có người thắng (trường hợp status = ended/pending)
          // Nếu status = cancelled hoặc không ai bid thì winner sẽ null
          if (winner && winner._id) {
            const ratingStats = await calculateUserRating(
              winner._id.toString()
            );

            // Gán rating vào object người thắng
            product.auction.highestBidderId.rating = ratingStats.percentage;
          }

          return product;
        })
      );

      return {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
