const Product = require("../models/Product");
const SystemSetting = require("../models/System");
const User = require("../models/User");
const mongoose = require("mongoose");
const { calculateUserRating } = require("../utils/userUtils");
const sendEmail = require("../utils/sendEmail");

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Professional email helpers (blue theme)
const formatDateVN = (date) =>
  new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const wrapBidEmail = (title, heading, sectionsHtml) => `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    .pill{display:inline-block;padding:6px 10px;border-radius:999px;background:#e6f6fd;color:#0369a1;font-weight:600}
    .value{color:#0ea5e9;font-weight:700}
  </style>
</head>
<body style="margin:0;background:#f6f8fb;padding:24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(2,6,23,0.06)">
    <tr>
      <td style="background:#0ea5e9;padding:16px 20px;color:#fff;font-family:Segoe UI,Arial,Helvetica,sans-serif;">
        <strong style="font-size:16px;">Auctify</strong>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;font-family:Segoe UI,Arial,Helvetica,sans-serif;color:#0f172a;">
        ${heading}
        ${sectionsHtml}
        <p style="margin-top:18px;font-size:12px;color:#64748b">Đây là email tự động, vui lòng không trả lời.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

class AuctionService {
  static async placeBid(productId, userId, bidAmount) {
    // Khởi tạo Session
    const session = await mongoose.startSession();
    let emailTasks = [];

    try {
      let result;

      await session.withTransaction(async () => {
        const product = await Product.findById(productId)
          .populate("detail.sellerId", "email fullName")
          .session(session);

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

        if (product.auction.bannedBidders.includes(userId)) {
          const error = new Error(
            "Bạn đã bị người bán chặn khỏi sản phẩm này."
          );
          error.statusCode = 400; // Bad Request
          throw error;
        }

        if (product.detail.sellerId._id.toString() === userId.toString()) {
          const error = new Error(
            "Bạn không thể tự đấu giá sản phẩm của mình."
          );
          error.statusCode = 400; // Bad Request
          throw error;
        }

        const bidderRating = await calculateUserRating(userId);

        if (bidderRating.total > 0 && bidderRating.percentage < 80) {
          const error = new Error(
            "Bạn không đủ điều kiện để tham gia đấu giá sản phẩm này do tỷ lệ phản hồi không tốt."
          );
          error.statusCode = 400;
          throw error;
        }

        if (
          product.auction.allowNewBidders === false &&
          bidderRating.total === 0
        ) {
          const error = new Error(
            "Bạn không đủ điều kiện để tham gia đấu giá sản phẩm này do chưa có đánh giá nào."
          );
          error.statusCode = 400;
          throw error;
        }

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

        // CHUẨN BỊ DỮ LIỆU EMAIL
        // 1. Lấy thông tin người RA GIÁ (Current Bidder)
        const currentBidder = await User.findById(userId)
          .select("email fullName")
          .session(session);

        // 2. Lấy thông tin người GIỮ GIÁ TRƯỚC ĐÓ (Previous Leader)
        const previousLeaderId = product.auction.highestBidderId;
        let previousLeader = null;
        if (previousLeaderId) {
          previousLeader = await User.findById(previousLeaderId)
            .select("email fullName")
            .session(session);
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
        let isNewWinner = false;
        let isBuyNowSuccess = false;

        // TRƯỜNG HỢP A: Chưa có ai đặt (Sản phẩm mới)
        if (!currentLeaderId) {
          newHighestBidderId = userId;
          // Giá hiện tại = Giá khởi điểm (Người đầu tiên chỉ cần trả giá khởi điểm)
          newCurrentPrice = product.auction.startPrice;
          isNewWinner = true;
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
          isNewWinner = true;
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
            isNewWinner = true;
          }
          // C2. Người mới ra giá THẤP HƠN hoặc BẰNG Người cũ (Old Winner stays)
          else {
            newHighestBidderId = currentLeaderId;

            // Giá mới = Max của người thua (người mới)
            newCurrentPrice = bidAmount;
          }
        }

        // 4. CẬP NHẬT TRẠNG THÁI (MUA NGAY)
        const isBuyNowTriggered =
          product.auction.buyNowPrice > 0 &&
          bidAmount >= product.auction.buyNowPrice;
        if (isBuyNowTriggered) {
          newCurrentPrice = product.auction.buyNowPrice;

          product.auction.currentPrice = newCurrentPrice;

          product.auction.status = "pending";
          product.auction.endTime = now;

          isBuyNowSuccess = true;
          isNewWinner = true;
        } else {
          if (
            product.auction.buyNowPrice > 0 &&
            newCurrentPrice >= product.auction.buyNowPrice
          ) {
            newCurrentPrice = product.auction.buyNowPrice;
            product.auction.currentPrice = newCurrentPrice;
            product.auction.status = "pending";
            product.auction.endTime = now;

            isBuyNowSuccess = true;
            isNewWinner = true;
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
        if (
          !isBuyNowSuccess &&
          product.auction.autoExtend &&
          product.auction.status === "active"
        ) {
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

        const productName = product.detail.name;
        const displayPrice = formatCurrency(newCurrentPrice);

        if (isBuyNowSuccess) {
          // A. Gửi Seller: Đã bán được hàng
          {
            const subject = `[Seller] Chốt đơn Mua Ngay: ${productName}`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Sản phẩm đã kết thúc phiên đấu giá! 🎉</h2>`;
            const sections = `
                  <p>Một người dùng đã chốt giá Mua Ngay.</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                    <tr>
                      <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                        <div style="margin-bottom:6px"><strong>Sản phẩm:</strong> ${productName}</div>
                        <div><strong>Giá chốt:</strong> <span class="value">${displayPrice}</span></div>
                        <div style="margin-top:6px;font-size:12px;color:#64748b">Trạng thái: Chờ thanh toán (Pending)</div>
                      </td>
                    </tr>
                  </table>`;
            emailTasks.push({
              to: product.detail.sellerId.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }

          // B. Gửi Winner (Người mua): Chúc mừng
          {
            const subject = `[Winner] Bạn đã chiến thắng: ${productName}`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Chúc mừng bạn đã chiến thắng! 🏆</h2>`;
            const sections = `
                  <p>Bạn đã chiến thắng sản phẩm <strong>${productName}</strong> thông qua tính năng Mua Ngay.</p>
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                    <tr>
                      <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                        <div><strong>Giá cuối cùng:</strong> <span class="value">${displayPrice}</span></div>
                      </td>
                    </tr>
                  </table>
                  <p>Vui lòng tiến hành thanh toán để hoàn tất giao dịch.</p>`;
            emailTasks.push({
              to: currentBidder.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }
        } else if (isNewWinner) {
          // ---> A. Gửi Seller: Có giá mới
          {
            const subject = `[Seller] Giá mới: ${productName}`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Có giá mới cho <span class="pill">${productName}</span></h2>`;
            const sections = `
              <p style="margin:0 0 12px 0;line-height:1.6">Một người dùng vừa đặt giá mới.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                <tr>
                  <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                    <div style="margin-bottom:6px"><strong>Sản phẩm:</strong> ${productName}</div>
                    <div><strong>Giá hiện tại:</strong> <span class="value">${displayPrice}</span></div>
                  </td>
                </tr>
              </table>`;
            emailTasks.push({
              to: product.detail.sellerId.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }

          // ---> B. Gửi Bidder mới: Chúc mừng
          {
            const subject = `[Bidder] Dẫn đầu: ${productName}`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Chúc mừng, bạn đang dẫn đầu! 🎉</h2>`;
            const sections = `
              <p style="margin:0 0 12px 0;line-height:1.6">Bạn vừa dẫn đầu phiên đấu giá cho <strong>${productName}</strong>.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                <tr>
                  <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                    <div style="margin-bottom:6px"><strong>Sản phẩm:</strong> ${productName}</div>
                    <div><strong>Giá hiện tại:</strong> <span class="value">${displayPrice}</span></div>
                  </td>
                </tr>
              </table>`;
            emailTasks.push({
              to: currentBidder.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }

          // ---> C. Gửi Leader cũ: Bị vượt mặt (Chỉ gửi nếu khác người mới)
          if (
            previousLeader &&
            previousLeaderId.toString() !== userId.toString()
          ) {
            const subject = `[Alert] Bạn đã bị vượt giá: ${productName}`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Bạn vừa bị vượt giá</h2>`;
            const sections = `
              <p style="margin:0 0 12px 0;line-height:1.6">Giá của bạn cho <strong>${productName}</strong> đã bị vượt qua.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                <tr>
                  <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                    <div style="margin-bottom:6px"><strong>Sản phẩm:</strong> ${productName}</div>
                    <div><strong>Giá hiện tại:</strong> <span class="value">${displayPrice}</span></div>
                  </td>
                </tr>
              </table>`;
            emailTasks.push({
              to: previousLeader.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }
        } else {
          // ---> D. Gửi Bidder mới (Nhưng thua ngay lập tức do Auto-bid):
          {
            const subject = `[Bidder] Bạn đã bị vượt qua tự động!`;
            const heading = `<h2 style="margin:0 0 10px 0;font-size:20px">Bạn đã bị vượt giá tự động</h2>`;
            const sections = `
              <p style="margin:0 0 12px 0;line-height:1.6">Giá bạn đặt cho <strong>${productName}</strong> thấp hơn giá trần của người dẫn đầu hiện tại.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:12px 0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px">
                <tr>
                  <td style="padding:12px 14px;font-size:14px;color:#0f172a">
                    <div style="margin-bottom:6px"><strong>Sản phẩm:</strong> ${productName}</div>
                    <div style="margin-bottom:6px"><strong>Người đấu giá dẫn đầu:</strong> Ẩn danh</div>
                    <div><strong>Giá hiện tại:</strong> <span class="value">${displayPrice}</span></div>
                  </td>
                </tr>
              </table>`;
            emailTasks.push({
              to: currentBidder.email,
              subject,
              content: wrapBidEmail(subject, heading, sections),
            });
          }

          // (Optional: Có thể gửi Seller thông báo giá nhảy lên, nhưng thường để tránh spam thì thôi)
        }

        await product.save({ session });

        result = {
          message:
            newHighestBidderId.toString() === userId.toString()
              ? "Đặt giá thành công! Bạn đang dẫn đầu."
              : "Đặt giá thành công!",
        };
      });

      // XỬ LÝ GỬI EMAIL SAU KHI TRANSACTION HOÀN TẤT
      Promise.all(
        emailTasks.map((task) => sendEmail(task.to, task.subject, task.content))
      );

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

  static async kickBidder(productId, sellerId, bidderIdToKick) {
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

        if (product.detail.sellerId.toString() !== sellerId.toString()) {
          const error = new Error(
            "Chỉ người bán mới có quyền chặn người đấu giá."
          );
          error.statusCode = 400; // Bad Request
          throw error;
        }

        if (product.auction.status !== "active") {
          const error = new Error(
            "Chỉ có thể chặn người dùng khi phiên đấu giá đang diễn ra."
          );
          error.statusCode = 400;
          throw error;
        }

        // 2. THỰC HIỆN CHẶN
        if (!product.auction.bannedBidders.includes(bidderIdToKick)) {
          product.auction.bannedBidders.push(bidderIdToKick);
        }

        // 3. Dọn dẹp lịch sử
        product.auctionHistory.historyList =
          product.auctionHistory.historyList.filter(
            (h) => h.bidderId.toString() !== bidderIdToKick.toString()
          );

        product.auctionHistory.numberOfBids =
          product.auctionHistory.historyList.length;

        // 4. Tính toán lại người dẫn đầu & giá hiện tại
        const remainingBids = product.auctionHistory.historyList;

        if (remainingBids.length === 0) {
          product.auction.currentPrice = product.auction.startPrice;
          product.auction.highestBidderId = null;
          product.auction.bidders = 0;
        } else {
          // Group by User để tìm Max Bid của từng người còn lại
          // (Vì một người có thể bid nhiều lần, ta chỉ quan tâm lần cao nhất của họ)
          const bidderMap = {};

          remainingBids.forEach((bid) => {
            const bId = bid.bidderId.toString();

            if (!bidderMap[bId]) {
              bidderMap[bId] = { price: bid.bidPrice, time: bid.bidTime };
            } else {
              if (bid.bidPrice > bidderMap[bId].price) {
                // Tìm thấy giá cao hơn -> Cập nhật
                bidderMap[bId] = { price: bid.bidPrice, time: bid.bidTime };
              }
            }
          });

          const sortedBidders = Object.keys(bidderMap)
            .map((id) => ({
              id,
              price: bidderMap[id].price,
              time: bidderMap[id].time,
            }))
            .sort((a, b) => {
              // Ưu tiên 1: Giá giảm dần
              if (b.price !== a.price) {
                return b.price - a.price;
              }
              // Ưu tiên 2: Thời gian tăng dần (Đến sớm xếp trên)
              return new Date(a.time) - new Date(b.time);
            });

          // Người đứng đầu (Leader mới)
          const newLeader = sortedBidders[0];
          product.auction.highestBidderId = newLeader.id;

          // Tính lại số người tham gia
          product.auction.bidders = sortedBidders.length;

          // Tính giá hiện tại (Current Price)
          if (sortedBidders.length === 1) {
            product.auction.currentPrice = product.auction.startPrice;
          } else {
            const runnerUp = sortedBidders[1]; // Người về nhì

            product.auction.currentPrice = runnerUp.price;
          }
        }

        // 5. LƯU & CẬP NHẬT USER
        await User.findByIdAndUpdate(
          bidderIdToKick,
          { $pull: { auctionsParticipated: productId } },
          { session }
        );

        // 6. LƯU SẢN PHẨM
        await product.save({ session });

        result = { message: "Chặn người đấu giá thành công." };
      });

      return result;
    } catch (error) {
      if (
        error.name === "VersionError" ||
        (error.errorLabels &&
          error.errorLabels.includes("TransientTransactionError"))
      ) {
        const retryError = new Error("Dữ liệu thay đổi, vui lòng thử lại.");
        retryError.statusCode = 409;
        throw retryError;
      }
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = AuctionService;
