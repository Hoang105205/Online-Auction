const SystemSetting = require("../models/System");
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const ROLES_LIST = require("../config/roles_list");
const sendEmail = require("../utils/sendEmail");

// Helpers for email formatting
const formatDateVN = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const wrapEmail = (
  titleColor,
  heading,
  bodyHtml,
  footerNote = "Đây là email tự động, vui lòng không trả lời."
) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Auctify</title>
  <style>
    .btn{ display:inline-block; padding:10px 16px; background:${titleColor}; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600 }
  </style>
</head>
<body style="margin:0;background:#f6f8fb;padding:24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(2,6,23,0.06)">
    <tr>
      <td style="background:${titleColor}; padding:16px 20px; color:#fff; font-family:Segoe UI,Arial,Helvetica,sans-serif;">
        <strong style="font-size:16px;">Auctify</strong>
      </td>
    </tr>
    <tr>
      <td style="padding:20px; font-family:Segoe UI,Arial,Helvetica,sans-serif; color:#0f172a;">
        ${heading}
        ${bodyHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px; font-family:Segoe UI,Arial,Helvetica,sans-serif; color:#64748b; font-size:12px; background:#f8fafc;">
        ${footerNote}
      </td>
    </tr>
  </table>
</body>
</html>`;

class SystemService {
  static async getConfig() {
    let sys = await SystemSetting.findOne().exec();
    if (!sys) {
      sys = await SystemSetting.create({});
    }
    return sys;
  }

  static async getTimeConfigs() {
    let sys = await SystemSetting.findOne()
      .select("autoExtendBefore autoExtendDuration latestProductTimeConfig")
      .exec();
    return sys;
  }

  static async updateConfig(updateData) {
    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateAutoExtendBefore(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
      const error = new Error("autoExtendBefore must be a non-negative number");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $set: { autoExtendBefore: n } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }
  static async updateAutoExtendDuration(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
      const error = new Error(
        "autoExtendDuration must be a non-negative number"
      );
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $set: { autoExtendDuration: n } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }
  static async updateLatestProductTimeConfig(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 0) {
      const error = new Error(
        "latestProductTimeConfig must be a non-negative number"
      );
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $set: { latestProductTimeConfig: n } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateTimeConfigs({
    autoExtendBefore,
    autoExtendDuration,
    latestProductTimeConfig,
  } = {}) {
    const update = {};
    if (autoExtendBefore !== undefined)
      update.autoExtendBefore = Number(autoExtendBefore);
    if (autoExtendDuration !== undefined)
      update.autoExtendDuration = Number(autoExtendDuration);
    if (latestProductTimeConfig !== undefined)
      update.latestProductTimeConfig = Number(latestProductTimeConfig);

    // validate
    for (const [k, v] of Object.entries(update)) {
      if (Number.isNaN(v) || v < 0) {
        const error = new Error(`${k} must be a non-negative number`);
        error.statusCode = 400;
        throw error;
      }
    }

    if (Object.keys(update).length === 0) {
      return await SystemSetting.findOne().exec();
    }

    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  // ===== Hoang =====
  static async getSellerRequests({ page = 1, limit = 6, sortBy = "date" }) {
    const order = sortBy === "name" ? "asc" : "desc";

    const sys = await SystemSetting.findOne()
      .select("sellerRequests")
      .populate({
        path: "sellerRequests.bidderId",
        select: "fullName",
      })
      .lean()
      .exec();

    if (!sys || !sys.sellerRequests) {
      return {
        requests: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: page,
          limit: limit,
        },
      };
    }

    let requests = sys.sellerRequests.filter((r) => r.bidderId); // filter out invalid requests

    // Sort
    requests.sort((a, b) => {
      let compareA, compareB;

      if (sortBy === "name") {
        compareA = a.bidderId.fullName.toLowerCase();
        compareB = b.bidderId.fullName.toLowerCase();
      } else {
        compareA = new Date(a.dateStart).getTime();
        compareB = new Date(b.dateStart).getTime();
      }

      if (compareA < compareB) return order === "asc" ? -1 : 1;
      if (compareA > compareB) return order === "asc" ? 1 : -1;
      return 0;
    });

    const totalItems = requests.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedRequests = requests.slice((page - 1) * limit, page * limit);

    return {
      requests: paginatedRequests,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  static async approveSellerRequest(bidderId) {
    if (!bidderId) {
      const error = new Error("bidderId is required");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOne().exec();
    if (!sys) {
      const error = new Error("System config not found");
      error.statusCode = 500;
      throw error;
    }

    const idx = sys.sellerRequests.findIndex(
      (r) => r.bidderId && r.bidderId.toString() === bidderId.toString()
    );
    if (idx === -1) {
      const error = new Error("Seller request not found");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(bidderId).exec();
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    if (!user.roles.includes(ROLES_LIST.Seller)) {
      user.roles.push(ROLES_LIST.Seller);
    }

    user.sellerRequest = {
      status: "approved",
      startDate: new Date(),
    };

    await user.save();

    // 3. Gửi Email chúc mừng (UI chuyên nghiệp) và tính đúng ngày kết thúc
    const subject = "🎉 Yêu cầu trở thành Seller đã được chấp thuận";
    const startDate = new Date(user.sellerRequest.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const heading = `<h2 style="margin:0 0 10px 0; font-size:20px;">Chúc mừng, ${user.fullName}! 🎉</h2>`;
    const bodyHtml = `
      <p style="margin:0 0 12px 0; line-height:1.6;">Yêu cầu trở thành <strong>Người bán (Seller)</strong> của bạn đã được Admin phê duyệt.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:14px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
        <tr>
          <td style="padding:12px 14px; font-size:14px; color:#0f172a;">
            <div style="margin-bottom:6px;"><strong>Hiệu lực từ:</strong> ${formatDateVN(
              startDate
            )}</div>
            <div><strong>Hết hạn vào:</strong> ${formatDateVN(endDate)}</div>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 18px 0; color:#334155; line-height:1.6;">Bạn có thể bắt đầu đăng sản phẩm và quản lý các phiên đấu giá của mình ngay bây giờ.</p>
      <p style="margin:18px 0 0 0; font-size:12px; color:#64748b;">Lưu ý: Quyền Seller có thời hạn 7 ngày kể từ ngày được phê duyệt.</p>
    `;
    const html = wrapEmail("#0ea5e9", heading, bodyHtml);
    sendEmail(user.email, subject, html).catch(console.error);

    // 4. Xóa request khỏi hàng đợi System
    sys.sellerRequests.splice(idx, 1);
    await sys.save();

    return { message: "Đã duyệt thành công." };
  }

  static async rejectSellerRequest(bidderId) {
    if (!bidderId) {
      const error = new Error("bidderId is required");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOne().exec();
    if (!sys) {
      const error = new Error("System config not found");
      error.statusCode = 500;
      throw error;
    }

    const idx = sys.sellerRequests.findIndex(
      (r) => r.bidderId && r.bidderId.toString() === bidderId.toString()
    );

    if (idx === -1) {
      const error = new Error("Seller request not found");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(bidderId).exec();
    if (user) {
      user.sellerRequest = {
        status: "none",
        startDate: null,
      };
      await user.save();

      const subject = "❌ Yêu cầu trở thành Seller bị từ chối";
      const heading = `<h2 style=\"margin:0 0 10px 0; font-size:20px;\">Rất tiếc, ${user.fullName} 😔</h2>`;
      const bodyHtml = `
        <p style=\"margin:0 0 12px 0; line-height:1.6;\">Yêu cầu trở thành <strong>Người bán (Seller)</strong> của bạn chưa được chấp thuận vào thời điểm này.</p>
        <p style=\"margin:0 0 12px 0; line-height:1.6;\">Bạn có thể xem lại hồ sơ, bổ sung thông tin cần thiết và gửi yêu cầu lại sau.</p>
        `;
      const html = wrapEmail("#ef4444", heading, bodyHtml);
      sendEmail(user.email, subject, html).catch(console.error);
    }

    // Xóa request khỏi hàng đợi System
    sys.sellerRequests.splice(idx, 1);
    await sys.save();

    return { message: "Đã từ chối yêu cầu thành công." };
  }
  // ===== Hoang =====

  // Categories management
  static async getCategories() {
    const sys = await SystemSetting.findOne().exec();
    return sys ? sys.categories : [];
  }

  static async addCategory({
    categoryId = null,
    categoryName = "",
    slug = "",
    subCategories = [],
  } = {}) {
    const cat = {
      categoryId:
        categoryId && mongoose.Types.ObjectId.isValid(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : undefined,
      categoryName,
      slug,
      subCategories: Array.isArray(subCategories)
        ? subCategories.map((s) => ({
            subCategoryId:
              s.subCategoryId &&
              mongoose.Types.ObjectId.isValid(s.subCategoryId)
                ? new mongoose.Types.ObjectId(s.subCategoryId)
                : undefined,
            subCategoryName: s.subCategoryName || s.name || "",
            slug: s.slug || s.subCategorySlug || "",
          }))
        : [],
    };

    // remove undefined fields to keep doc clean
    if (!cat.categoryId) delete cat.categoryId;

    const sys = await SystemSetting.findOneAndUpdate(
      {},
      { $push: { categories: cat } },
      { new: true, upsert: true }
    ).exec();
    return sys;
  }

  static async updateCategory(categoryId, updateData = {}) {
    if (!categoryId) {
      const error = new Error("phải có categoryId");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOne().exec();
    if (!sys) {
      const error = new Error("Không tìm thấy cấu hình hệ thống");
      error.statusCode = 500;
      throw error;
    }

    // Find by categoryId (ref) OR by subdocument _id
    const cat = sys.categories.find((c) => {
      if (c.categoryId && c.categoryId.toString() === categoryId.toString())
        return true;
      if (c._id && c._id.toString() === categoryId.toString()) return true;
      return false;
    });
    if (!cat) {
      const error = new Error("Không tìm thấy danh mục");
      error.statusCode = 404;
      throw error;
    }

    if (updateData.categoryName !== undefined)
      cat.categoryName = updateData.categoryName;
    if (updateData.slug !== undefined) cat.slug = updateData.slug;
    if (Array.isArray(updateData.subCategories)) {
      cat.subCategories = updateData.subCategories.map((s) => ({
        subCategoryId:
          s.subCategoryId && mongoose.Types.ObjectId.isValid(s.subCategoryId)
            ? new mongoose.Types.ObjectId(s.subCategoryId)
            : undefined,
        subCategoryName: s.subCategoryName || s.name || "",
        slug: s.slug || s.subCategorySlug || "",
      }));
    }

    await sys.save();
    return sys;
  }

  static async removeCategory(categoryId) {
    if (!categoryId) {
      const error = new Error("phải có categoryId");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOne().exec();
    if (!sys) return null;

    // find the category first
    const cat = sys.categories.find((c) => {
      if (c.categoryId && c.categoryId.toString() === categoryId.toString())
        return true;
      if (c._id && c._id.toString() === categoryId.toString()) return true;
      return false;
    });
    if (!cat) {
      const error = new Error("Không tìm thấy danh mục");
      error.statusCode = 404;
      throw error;
    }

    // ensure we have a categoryName to check against products
    const categoryName = (cat.categoryName || "").trim();
    if (!categoryName) {
      const error = new Error(
        "Không thể xóa danh mục mà không có tên danh mục. Vui lòng đặt tên danh mục trước."
      );
      error.statusCode = 400;
      throw error;
    }

    // check if any product uses this category (products store category as string)
    const exists = await Product.exists({ "detail.category": categoryName });
    if (exists) {
      const error = new Error(
        "Không thể xóa danh mục: có sản phẩm đang sử dụng danh mục này."
      );
      error.statusCode = 400;
      throw error;
    }

    // safe to remove
    sys.categories = sys.categories.filter(
      (c) =>
        !(c.categoryId && c.categoryId.toString() === categoryId.toString())
    );

    await sys.save();
    return sys;
  }

  // Admin listing helpers
  static async listUsers({ page = 1, limit = 20, q = "" } = {}) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Number(limit) || 20);
    q = (q || "").trim();

    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [{ fullName: re }, { email: re }];
    }

    const total = await User.countDocuments(filter).exec();
    const users = await User.find(filter)
      .select(
        "-password -refreshToken -otp -otpExpires -resetPasswordToken -resetPasswordExpires -__v"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  }

  static async listProducts({ page = 1, limit = 20, q = "", status } = {}) {
    page = Math.max(1, Number(page) || 1);
    limit = Math.min(100, Number(limit) || 20);
    q = (q || "").trim();

    const filter = {};
    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [
        { "detail.name": re },
        { "detail.description": re },
        { "detail.category": re },
      ];
    }
    if (status !== undefined && status !== null && String(status).length)
      filter["auction.status"] = status;

    const total = await Product.countDocuments(filter).exec();
    const products = await Product.find(filter)
      .select(
        "detail.name detail.description detail.category detail.subCategory detail.images detail.sellerId auction auctionHistory"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("detail.sellerId", "fullName email")
      .lean()
      .exec();

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: products,
    };
  }

  static async removeProduct(productId) {
    if (!productId) {
      const error = new Error("phải có productId");
      error.statusCode = 400;
      throw error;
    }

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      const error = new Error("Invalid productId");
      error.statusCode = 400;
      throw error;
    }

    const prod = await Product.findById(productId).exec();
    if (!prod) {
      const error = new Error("Không tìm thấy sản phẩm");
      error.statusCode = 404;
      throw error;
    }

    await Product.deleteOne({ _id: productId }).exec();
    return prod;
  }

  static async getCategoryBySlug(slug) {
    const sys = await SystemSetting.findOne(
      { "categories.slug": slug },
      { "categories.$": 1 }
    ).exec();

    return sys ? sys.categories[0] : null;
  }

  static async removeSubCategory(categoryId, subCategoryId) {
    if (!categoryId) {
      const error = new Error("phải có categoryId");
      error.statusCode = 400;
      throw error;
    }

    if (!subCategoryId) {
      const error = new Error("phải có subCategoryId");
      error.statusCode = 400;
      throw error;
    }

    const sys = await SystemSetting.findOne().exec();
    if (!sys) {
      const error = new Error("Không tìm thấy cấu hình hệ thống");
      error.statusCode = 500;
      throw error;
    }

    // Find the category
    const cat = sys.categories.find((c) => {
      if (c.categoryId && c.categoryId.toString() === categoryId.toString())
        return true;
      if (c._id && c._id.toString() === categoryId.toString()) return true;
      return false;
    });

    if (!cat) {
      const error = new Error("Không tìm thấy danh mục");
      error.statusCode = 404;
      throw error;
    }

    // Find the subcategory (accept both subdocument _id and subCategoryId field)
    const targetSubCategoryId = subCategoryId.toString();
    const subCat = cat.subCategories.find((s) => {
      const matchesDocId = s._id && s._id.toString() === targetSubCategoryId;
      const matchesRefId =
        s.subCategoryId && s.subCategoryId.toString() === targetSubCategoryId;
      return matchesDocId || matchesRefId;
    });

    if (!subCat) {
      const error = new Error("SubCategory not found");
      error.statusCode = 404;
      throw error;
    }
    // Get the subcategory name to check products
    const subCategoryName = (subCat.subCategoryName || "").trim();
    if (!subCategoryName) {
      const error = new Error(
        "Không thể xóa danh mục phụ mà không có tên danh mục phụ. Vui lòng đặt tên danh mục phụ trước."
      );
      error.statusCode = 400;
      throw error;
    }

    // Check if any product uses this subcategory
    // Products store subCategory as string
    const categoryName = (cat.categoryName || "").trim();
    const exists = await Product.exists({
      "detail.category": categoryName,
      "detail.subCategory": subCategoryName,
    });

    if (exists) {
      const error = new Error(
        "Không thể xóa danh mục phụ: có sản phẩm đang sử dụng danh mục phụ này."
      );
      error.statusCode = 400;
      throw error;
    }

    // Safe to remove - filter out the subcategory
    cat.subCategories = cat.subCategories.filter((s) => {
      const matchesDocId = s._id && s._id.toString() === targetSubCategoryId;
      const matchesRefId =
        s.subCategoryId && s.subCategoryId.toString() === targetSubCategoryId;
      return !(matchesDocId || matchesRefId);
    });

    await sys.save();
    return sys;
  }

  static async getDashboardStats() {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Total products
      const totalProducts = await Product.countDocuments().exec();

      // New products in last 24h
      const newProducts24h = await Product.countDocuments({
        createdAt: { $gte: oneDayAgo },
      }).exec();

      // Ongoing auctions (status === "ongoing")
      const ongoingAuctions = await Product.countDocuments({
        "auction.status": "ongoing",
      }).exec();

      // Completed auctions (status === "completed")
      const completedAuctions = await Product.countDocuments({
        "auction.status": "completed",
      }).exec();

      // Total revenue (sum of all completed auction prices)
      const revenueResult = await Product.aggregate([
        { $match: { "auction.status": "completed" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$auction.currentPrice" },
          },
        },
      ]).exec();
      const totalRevenue = revenueResult[0]?.totalRevenue || 0;

      // Recent completed auctions (last 5 with images)
      const recentAuctions = await Product.find({
        "auction.status": "completed",
      })
        .select("detail auction createdAt")
        .sort({ "auction.endTime": -1 })
        .limit(5)
        .lean()
        .exec();

      // Get top 3 seller upgrade requests (newest first)
      const sys = await SystemSetting.findOne()
        .select("sellerRequests")
        .populate({
          path: "sellerRequests.bidderId",
          select: "fullName email",
        })
        .lean()
        .exec();

      let upgradeRequests = [];
      let pendingRequestsCount = 0;
      if (sys && sys.sellerRequests && sys.sellerRequests.length > 0) {
        const validRequests = sys.sellerRequests.filter((r) => r.bidderId);
        pendingRequestsCount = validRequests.length;

        upgradeRequests = validRequests
          .sort((a, b) => {
            // Sort by dateStart descending (newest first)
            const timeA = new Date(a.dateStart).getTime();
            const timeB = new Date(b.dateStart).getTime();
            return timeB - timeA;
          })
          .slice(0, 3) // Take top 3
          .map((r) => ({
            bidderId: r.bidderId._id,
            name: r.bidderId.fullName,
            email: r.bidderId.email,
            dateStart: r.dateStart,
          }));
      }

      const newUsers7d = await User.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      }).exec();

      return {
        totalProducts,
        ongoingAuctions,
        completedAuctions,
        totalRevenue,
        newProducts24h,
        newUsers7d,
        pendingRequestsCount,
        recentAuctions,
        upgradeRequests,
      };
    } catch (error) {
      const err = new Error("Error getting dashboard stats: " + error.message);
      err.statusCode = 500;
      throw err;
    }
  }
}

module.exports = SystemService;
