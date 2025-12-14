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

const recalculateAuctionAfterRemovingBidder = (product, bidderIdToRemove) => {
  // 1. Lọc bỏ lịch sử đấu giá của người này
  const originalCount = product.auctionHistory.historyList.length;
  product.auctionHistory.historyList =
    product.auctionHistory.historyList.filter(
      (h) => h.bidderId.toString() !== bidderIdToRemove.toString()
    );

  // Nếu không có gì thay đổi (user chưa từng bid), return luôn
  if (product.auctionHistory.historyList.length === originalCount) return;

  // Cập nhật số lượng bid
  product.auctionHistory.numberOfBids =
    product.auctionHistory.historyList.length;

  // 2. Tính toán lại Leader và Current Price
  const remainingBids = product.auctionHistory.historyList;

  if (remainingBids.length === 0) {
    // Reset về trạng thái ban đầu
    product.auction.currentPrice = product.auction.startPrice;
    product.auction.highestBidderId = null;
    product.auction.bidders = 0;
  } else {
    // Group by User để tìm Max Bid của từng người còn lại
    const bidderMap = {};

    remainingBids.forEach((bid) => {
      const bId = bid.bidderId.toString();
      if (!bidderMap[bId]) {
        bidderMap[bId] = { price: bid.bidPrice, time: bid.bidTime };
      } else {
        if (bid.bidPrice > bidderMap[bId].price) {
          bidderMap[bId] = { price: bid.bidPrice, time: bid.bidTime };
        }
      }
    });

    // Sắp xếp: Giá giảm dần -> Thời gian tăng dần (đến sớm xếp trước)
    const sortedBidders = Object.keys(bidderMap)
      .map((id) => ({
        id,
        price: bidderMap[id].price,
        time: bidderMap[id].time,
      }))
      .sort((a, b) => {
        if (b.price !== a.price) return b.price - a.price;
        return new Date(a.time) - new Date(b.time);
      });

    // Người đứng đầu (Leader mới)
    const newLeader = sortedBidders[0];
    product.auction.highestBidderId = newLeader.id;

    // Tính lại số người tham gia (Unique)
    product.auction.bidders = sortedBidders.length;

    // Tính giá hiện tại (Current Price) theo luật Second-Price
    if (sortedBidders.length === 1) {
      product.auction.currentPrice = product.auction.startPrice;
    } else {
      const runnerUp = sortedBidders[1]; // Người về nhì
      product.auction.currentPrice = runnerUp.price;
    }
  }
};

module.exports = { calculateUserRating, recalculateAuctionAfterRemovingBidder };
