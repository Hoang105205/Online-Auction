const cron = require("node-cron");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");

const formatDateVN = (date) =>
  new Date(date).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

/**
 * Cron job to update auction status for expired products
 * Runs every minute to check for products that have passed their endTime
 * Status changes: active -> pending
 */
const startAuctionStatusJob = () => {
  // Run every minute: "* * * * *"
  // Run every 5 minutes: "*/5 * * * *"
  // Run every 10 minutes "*/10 * * * *"
  // Run every hour: "0 * * * *"
  // Run every 30 seconds: "*/30 * * * * *"
  cron.schedule("*/30 * * * * *", async () => {
    try {
      const now = new Date();

      // First, find all products that will be updated
      const expiredProducts = await Product.find({
        "auction.endTime": { $lt: now },
        "auction.status": "active",
      })
        .populate("detail.sellerId", "fullName email")
        .populate("auction.highestBidderId", "fullName email")
        .lean()
        .exec();

      if (expiredProducts.length === 0) {
        return;
      }

      // Update products without winner -> status = "ended"
      const resultNoWinner = await Product.updateMany(
        {
          "auction.endTime": { $lt: now },
          "auction.status": "active",
          "auction.highestBidderId": null,
        },
        {
          $set: {
            "auction.status": "ended",
          },
        }
      );

      // Update remaining products with winner -> status = "pending"
      const resultWithWinner = await Product.updateMany(
        {
          "auction.endTime": { $lt: now },
          "auction.status": "active",
        },
        {
          $set: {
            "auction.status": "pending",
          },
        }
      );

      const totalUpdated =
        resultNoWinner.modifiedCount + resultWithWinner.modifiedCount;

      console.log(
        `[${now.toISOString()}] Cron Job: Updated ${totalUpdated} expired auction(s) (${
          resultNoWinner.modifiedCount
        } ended, ${resultWithWinner.modifiedCount} pending)`
      );

      // Send emails for each expired product (non-blocking parallel execution)
      const emailPromises = expiredProducts.map(async (product) => {
        try {
          const seller = product.detail.sellerId;
          const buyer = product.auction.highestBidderId;
          const productName = product.detail.name;
          const finalPrice = product.auction.currentPrice;
          const endTime = product.auction.endTime;
          const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
          const productLink = `${clientUrl}/details/${product._id}`;
          const createProductLink = `${clientUrl}/account/my-products`;

          // Always send email to seller
          if (seller && seller.email) {
            let sellerSubject, sellerHeading, sellerBodyHtml;

            if (buyer) {
              // Auction had a winner
              sellerSubject = "🎉 Phiên đấu giá đã kết thúc - Có người thắng";
              sellerHeading = `<h2 style="margin:0 0 10px 0; font-size:20px;">Chúc mừng, ${seller.fullName}! 🎉</h2>`;
              sellerBodyHtml = `
              <p style="margin:0 0 12px 0; line-height:1.6;">Phiên đấu giá sản phẩm <strong>"${productName}"</strong> của bạn đã kết thúc với người thắng cuộc.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:14px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                <tr>
                  <td style="padding:12px 14px; font-size:14px; color:#0f172a;">
                    <div style="margin-bottom:6px;"><strong>Người thắng:</strong> ${
                      buyer.fullName
                    }</div>
                    <div style="margin-bottom:6px;"><strong>Giá cuối:</strong> ${finalPrice.toLocaleString(
                      "vi-VN"
                    )} VND</div>
                    <div><strong>Kết thúc lúc:</strong> ${formatDateVN(
                      endTime
                    )}</div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 18px 0; color:#334155; line-height:1.6;">Vui lòng liên hệ với người mua để hoàn tất giao dịch.</p>
              <div style="text-align:center; margin-top:24px;">
                <a href="${productLink}" class="btn" style="display:inline-block; padding:12px 24px; background:#0ea5e9; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600;">Xem sản phẩm</a>
              </div>
            `;
            } else {
              // No winner
              sellerSubject =
                "📋 Phiên đấu giá đã kết thúc - Không có người thắng";
              sellerHeading = `<h2 style="margin:0 0 10px 0; font-size:20px;">Thông báo kết thúc đấu giá</h2>`;
              sellerBodyHtml = `
              <p style="margin:0 0 12px 0; line-height:1.6;">Phiên đấu giá sản phẩm <strong>"${productName}"</strong> của bạn đã kết thúc.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:14px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
                <tr>
                  <td style="padding:12px 14px; font-size:14px; color:#0f172a;">
                    <div style="margin-bottom:6px;"><strong>Trạng thái:</strong> Không có người đặt giá</div>
                    <div><strong>Kết thúc lúc:</strong> ${formatDateVN(
                      endTime
                    )}</div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 18px 0; color:#334155; line-height:1.6;">Đừng lo lắng! Bạn có thể đăng lại sản phẩm này với giá khởi điểm phù hợp hơn.</p>
              <div style="text-align:center; margin-top:24px;">
                <a href="${createProductLink}" class="btn" style="display:inline-block; padding:12px 24px; background:#0ea5e9; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600;">Đăng sản phẩm mới</a>
              </div>
            `;
              // Ga dien, ban ko ai mua leu leu
            }

            const sellerHtml = wrapEmail(
              "#0ea5e9",
              sellerHeading,
              sellerBodyHtml
            );
            sendEmail(seller.email, sellerSubject, sellerHtml).catch((err) =>
              console.error("Error sending email to seller:", err.message)
            );
          }

          // Send email to buyer if exists
          if (buyer && buyer.email) {
            const buyerSubject = "🎉 Chúc mừng! Bạn đã thắng phiên đấu giá";
            const buyerHeading = `<h2 style="margin:0 0 10px 0; font-size:20px;">Chúc mừng, ${buyer.fullName}! 🎉</h2>`;
            const buyerBodyHtml = `
            <p style="margin:0 0 12px 0; line-height:1.6;">Bạn đã thắng phiên đấu giá sản phẩm <strong>"${productName}"</strong>!</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; margin:14px 0; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px;">
              <tr>
                <td style="padding:12px 14px; font-size:14px; color:#0f172a;">
                  <div style="margin-bottom:6px;"><strong>Người bán:</strong> ${
                    seller.fullName
                  }</div>
                  <div style="margin-bottom:6px;"><strong>Giá thắng:</strong> ${finalPrice.toLocaleString(
                    "vi-VN"
                  )} VND</div>
                  <div><strong>Kết thúc lúc:</strong> ${formatDateVN(
                    endTime
                  )}</div>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 18px 0; color:#334155; line-height:1.6;">Vui lòng liên hệ với người bán để hoàn tất giao dịch. Người bán sẽ liên hệ với bạn trong thời gian sớm nhất.</p>
            <div style="text-align:center; margin-top:24px;">
              <a href="${productLink}" class="btn" style="display:inline-block; padding:12px 24px; background:#0ea5e9; color:#fff !important; text-decoration:none; border-radius:8px; font-weight:600;">Xem sản phẩm</a>
            </div>
          `;

            const buyerHtml = wrapEmail("#0ea5e9", buyerHeading, buyerBodyHtml);
            sendEmail(buyer.email, buyerSubject, buyerHtml).catch((err) =>
              console.error("Error sending email to buyer:", err.message)
            );
          }
        } catch (error) {
          console.error(
            `Error processing emails for product ${product._id}:`,
            error.message
          );
        }
      });

      // Wait for all emails to be sent (non-blocking)
      await Promise.allSettled(emailPromises);
    } catch (error) {
      console.error(
        "[Auction Status Job] Error updating expired auctions:",
        error.message
      );
    }
  });

  console.log("Auction status cron job started.");
};

module.exports = startAuctionStatusJob;
