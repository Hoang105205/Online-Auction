const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * Cách dùng:
 * const { calculateUserRating } = require("../utils/userUtils");
 *  const rating = await calculateUserRating(userId);
 *
 * * Trả về:
 * {
 *  total: Số lượng feedback tổng cộng,
 *  good: Số lượng feedback tốt,
 *  bad: Số lượng feedback xấu,
 *  percentage: Tỷ lệ feedback tốt (%)
 * }
 *
 * Dùng với service
 * VD:
 * product {
 *  ...,
 *  sellerId: {
 *      id: "...",
 *      name: "...",
 *  },
 * }
 * const userRating = await calculateUserRating(product.sellerId.id);
 *
 * * Set thêm vào biến product
 * product.sellerId.rating = userRating.percentage; -> vừa tạo thêm thuộc tính rating cho sellerId vừa set tỷ lệ feedback
 *
 */
const calculateUserRating = async (userId) => {
  try {
    const id = mongoose.Types.ObjectId.createFromHexString(String(userId));

    const stats = await User.aggregate([
      { $match: { _id: id } },
      {
        $project: {
          // Merge both arrays
          allFeedbacks: {
            $concatArrays: [
              { $ifNull: ["$feedBackAsBidder", []] },
              { $ifNull: ["$feedBackAsSeller", []] },
            ],
          },
        },
      },
      {
        $project: {
          total: { $size: "$allFeedbacks" },
          good: {
            $size: {
              $filter: {
                input: "$allFeedbacks",
                as: "fb",
                cond: { $eq: ["$$fb.isGood", true] },
              },
            },
          },
        },
      },
      {
        $project: {
          total: 1,
          good: 1,
          bad: { $subtract: ["$total", "$good"] },
          percentage: {
            $cond: [
              { $eq: ["$total", 0] },
              100, // Default to 100% if no feedback
              {
                $round: [
                  { $multiply: [{ $divide: ["$good", "$total"] }, 100] },
                ],
              },
            ],
          },
        },
      },
    ]);

    // return defaults
    if (!stats || stats.length === 0) {
      return { total: 0, good: 0, bad: 0, percentage: 100 };
    }

    return stats[0]; // { _id, total, good, bad, percentage }
  } catch (error) {
    console.error(`Lỗi tính điểm rating cho user ${userId}:`, error.message);
    return { total: 0, good: 0, bad: 0, percentage: 100 };
  }
};

module.exports = { calculateUserRating };
