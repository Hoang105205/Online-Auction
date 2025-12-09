const Product = require("../models/Product");
const SystemSetting = require("../models/System");
const User = require("../models/User");
const mongoose = require("mongoose");

class AuctionService {
  static async placeBid(productId, userId, bidAmount) {
    // Khởi tạo Session
    const session = await mongoose.startSession();

    try {
      let result;

      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);

        // 1. VALIDATE CƠ BẢN
        if (!product) {
          const error = new Error("Sản phẩm không tồn tại.");
          error.statusCode = 404;
          throw error;
        }

        if (product.auction.status !== "active") {
          const error = new Error("Phiên đấu giá không khả dụng.");
          error.statusCode = 400; // Bad Request
          throw error;
        }

        const now = new Date();
        if (new Date(product.auction.endTime) < now) {
          const error = new Error("Phiên đấu giá đã kết thúc.");
          error.statusCode = 400; // Bad Request
          throw error;
        }

        if (product.detail.sellerId.toString() === userId.toString()) {
          const error = new Error(
            "Bạn không thể tự đấu giá sản phẩm của mình."
          );
          error.statusCode = 400; // Bad Request
          throw error;
        }

        //TODO: Kiểm tra rating của người đấu giá

        // Giá phải cao hơn hoặc bằng giá hiện tại
        const minEligibleBid = product.auction.highestBidderId
          ? product.auction.currentPrice
          : product.auction.startPrice;

        if (bidAmount < minEligibleBid) {
          const error = new Error(
            `Giá đặt phải cao hơn hoặc bằng ${minEligibleBid}.`
          );
          error.statusCode = 400;
          throw error;
        }

        // Xử lý Mua ngay
        if (
          product.auction.buyNowPrice > 0 &&
          bidAmount >= product.auction.buyNowPrice
        ) {
          bidAmount = product.auction.buyNowPrice;
        }

        if (
          (bidAmount - product.auction.startPrice) %
            product.auction.stepPrice !==
            0 &&
          bidAmount != product.auction.buyNowPrice
        ) {
          const error = new Error(
            `Giá đặt phải cách đều bước giá ${product.auction.stepPrice} từ giá khởi điểm ${product.auction.startPrice}.`
          );
          error.statusCode = 400;
          throw error;
        }

        // 2. TÌM GIÁ TRẦN CỦA NGƯỜI ĐANG THẮNG (Leader)
        const currentLeaderId = product.auction.highestBidderId;
        let currentLeaderMaxBid = 0;

        if (currentLeaderId) {
          const leaderHistory = product.auctionHistory.historyList
            .filter(
              (bid) => bid.bidderId.toString() === currentLeaderId.toString()
            )
            .sort((a, b) => b.bidPrice - a.bidPrice);

          if (leaderHistory.length > 0) {
            currentLeaderMaxBid = leaderHistory[0].bidPrice;
          }
        }

        // 3. THUẬT TOÁN ĐẤU GIÁ TỰ ĐỘNG
        let newCurrentPrice = product.auction.currentPrice;
        let newHighestBidderId = currentLeaderId;

        // TRƯỜNG HỢP A: Chưa có ai đặt (Sản phẩm mới)
        if (!currentLeaderId) {
          newHighestBidderId = userId;
          // Giá hiện tại = Giá khởi điểm (Người đầu tiên chỉ cần trả giá khởi điểm)
          newCurrentPrice = product.auction.startPrice;
        }
        // TRƯỜNG HỢP B: Người dùng tự nâng giá trần của mình lên
        else if (userId.toString() === currentLeaderId.toString()) {
          // Nếu họ đặt cao hơn mức cũ -> Cập nhật Max Bid (lưu vào history sau), giá hiện tại giữ nguyên
          // Nếu họ đặt thấp hơn mức Max cũ của chính họ -> Báo lỗi
          if (bidAmount <= currentLeaderMaxBid) {
            const error = new Error(
              "Bạn đang dẫn đầu. Vui lòng đặt giá cao hơn giá trần cũ của bạn nếu muốn cập nhật."
            );
            error.statusCode = 400;
            throw error;
          }

          newHighestBidderId = userId;
        }
        // TRƯỜNG HỢP C: Đấu với người khác
        else {
          // C1. Người mới ra giá CAO HƠN Người cũ (New Winner)
          if (bidAmount > currentLeaderMaxBid) {
            newHighestBidderId = userId;

            // Giá mới = Max của người thua + Bước giá
            let calculatedPrice =
              currentLeaderMaxBid + product.auction.stepPrice;
            newCurrentPrice = Math.min(calculatedPrice, bidAmount);
          }
          // C2. Người mới ra giá THẤP HƠN hoặc BẰNG Người cũ (Old Winner stays)
          else {
            newHighestBidderId = currentLeaderId;

            // Giá mới = Max của người thua (người mới)
            newCurrentPrice = bidAmount;
          }
        }

        // 4. CẬP NHẬT TRẠNG THÁI (MUA NGAY)
        // TODO: thêm vào sản phẩm đã thắng của người mua và sản phẩm đăng có người thắng của người bán
        const isBuyNowTriggered =
          product.auction.buyNowPrice > 0 &&
          bidAmount >= product.auction.buyNowPrice;
        if (isBuyNowTriggered) {
          newCurrentPrice = product.auction.buyNowPrice;

          product.auction.currentPrice = newCurrentPrice;

          product.auction.status = "pending";
          product.auction.endTime = now;
        } else {
          if (
            product.auction.buyNowPrice > 0 &&
            newCurrentPrice >= product.auction.buyNowPrice
          ) {
            newCurrentPrice = product.auction.buyNowPrice;
            product.auction.currentPrice = newCurrentPrice;
            product.auction.status = "pending";
            product.auction.endTime = now;
          } else {
            product.auction.currentPrice = newCurrentPrice;
          }
        }

        product.auction.highestBidderId = newHighestBidderId;

        // 5. LƯU LỊCH SỬ ĐẤU GIÁ
        product.auctionHistory.historyList.push({
          bidderId: userId,
          bidPrice: bidAmount,
          bidTime: now,
        });

        product.auctionHistory.numberOfBids += 1;

        // Đếm số người tham gia (Unique)
        const uniqueBidders = new Set(
          product.auctionHistory.historyList.map((h) => h.bidderId.toString())
        );
        product.auction.bidders = uniqueBidders.size;

        // 6. CẬP NHẬT USER
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { auctionsParticipated: productId } },
          { session }
        );

        // 7. AUTO EXTEND (Gia hạn tự động)
        if (product.auction.autoExtend && product.auction.status === "active") {
          const sys = await SystemSetting.findOne().session(session);

          if (sys) {
            const extendBefore = (sys.autoExtendBefore || 0) * 60 * 1000;
            const extendDuration = (sys.autoExtendDuration || 0) * 60 * 1000;

            const timeRemaining =
              new Date(product.auction.endTime).getTime() - now.getTime();
            if (timeRemaining > 0 && timeRemaining <= extendBefore) {
              const newEndTime = new Date(
                new Date(product.auction.endTime).getTime() + extendDuration
              );
              product.auction.endTime = newEndTime;
              console.log(
                `⏳ Đấu giá ${productId} được gia hạn đến ${newEndTime}`
              );
            }
          }
        }

        await product.save({ session });

        result = {
          message:
            newHighestBidderId.toString() === userId.toString()
              ? "Đặt giá thành công! Bạn đang dẫn đầu."
              : "Đặt giá thành công!",
        };
      });

      return result;
    } catch (err) {
      // Xử lý lỗi VersionError (Concurrency)
      if (
        err.name === "VersionError" ||
        (err.errorLabels &&
          err.errorLabels.includes("TransientTransactionError"))
      ) {
        const retryError = new Error("Dữ liệu đã thay đổi. Vui lòng thử lại.");
        retryError.statusCode = 409;
        throw retryError;
      }
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = AuctionService;
