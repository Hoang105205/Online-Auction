const Product = require("../models/Product");
const User = require("../models/User");
const System = require("../models/System");
const cloudinary = require("../config/cloudinary");
const mongoose = require("mongoose");
const { calculateUserRating } = require("../utils/userUtils");
const sendEmail = require("../utils/sendEmail");

// Utility function to extract publicId from Cloudinary URL
function getPublicIdFromUrl(url) {
  const parts = url.split("products/");
  if (parts.length < 2) return null;
  return "products/" + parts[1].replace(/\.[^/.]+$/, ""); // Remove extension
}

// Utility function to upload single image to Cloudinary
async function uploadImageToCloudinary(file, productId, index) {
  // If already uploaded (has path/location/url)
  if (file.path || file.location || file.url) {
    return file.path || file.location || file.url;
  }

  // Upload buffer to Cloudinary
  if (file.buffer) {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `products/${productId}`,
      public_id: `${Date.now()}_${index}`,
      quality: "auto",
      fetch_format: "auto",
      transformation: [{ width: 1800, height: 1800, crop: "limit" }],
    });

    if (result?.secure_url || result?.url) {
      const fullUrl = result.secure_url || result.url;
      return getPublicIdFromUrl(fullUrl);
    }
  }

  return null;
}

class ProductService {
  // get product basic details (for above information)
  static async getProductBasicDetails(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName feedBackAsSeller")
        .lean()
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      const sys = await System.findOne({}).lean().exec();

      if (sys && sys.categories) {
        const cat = sys.categories.find(
          (c) => c._id.toString() === product.detail.category.toString()
        );
        if (cat) {
          const categoryName = cat.categoryName;
          const categorySlug = cat.slug;

          const subCat = cat.subCategories?.find(
            (sc) => sc._id.toString() === product.detail.subCategory.toString()
          );

          product.detail.category = categoryName;
          product.detail.categorySlug = categorySlug;

          if (subCat) {
            product.detail.subCategory = subCat.subCategoryName;
            product.detail.subCategorySlug = subCat.slug;
          }
        }
      }

      const rating = await calculateUserRating(product.detail.sellerId._id);
      product.detail.sellerId.rating = rating.percentage;

      return {
        detail: product.detail,
      };
    } catch (error) {
      throw new Error("Error getting product details: " + error.message);
    }
  }

  static async getProductAuction(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("auction.highestBidderId", "fullName feedBackAsBidder")
        .lean()
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.auction.highestBidderId) {
        const bidderRating = await calculateUserRating(
          product.auction.highestBidderId._id
        );
        product.auction.highestBidderId.rating = bidderRating.percentage;
      }

      return {
        auction: product.auction,
      };
    } catch (error) {
      throw new Error("Error getting product auction: " + error.message);
    }
  }

  // update product description
  static async updateDescription(productId, newContent, sellerId) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.detail.sellerId.toString() !== sellerId) {
        throw new Error(
          "Unauthorized: Only the seller can update the description"
        );
      }

      product.detail.description = newContent;
      await product.save();

      return product;
    } catch (error) {
      throw new Error("Error updating description: " + error.message);
    }
  }

  // get product description
  static async getProductDescription(productId) {
    try {
      const product = await Product.findById(productId).exec();
      if (!product) {
        throw new Error("Product not found");
      }
      return product.detail.description;
    } catch (error) {
      throw new Error("Error getting product description: " + error.message);
    }
  }

  // add question to ProductDetailsQNA
  static async addQuestion(productId, sendId, message, type = "public") {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName email")
        .populate("chat.sendId", "fullName");

      if (!product) {
        throw new Error("Product not found");
      }

      const sender = await User.findById(sendId).select("fullName").exec();

      product.chat.push({
        type,
        sendId,
        message,
        time: new Date(),
        reply: {},
      });

      await product.save();

      if (product.detail.sellerId.email) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const productLink = `${clientUrl}/details/${productId}`;

        const subject = `Bạn có 1 câu hỏi cần trả lời về sản phẩm "${product.detail.name}"`;

        const htmlMessage = `
        <div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#1f2937;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
              <p style="margin:8px 0 0;font-size:13px;font-weight:500;color:#e0f2fe;letter-spacing:1px;text-transform:uppercase;">Câu hỏi mới về sản phẩm</p>
            </div>

            <!-- Body -->
            <div style="padding:38px 40px 30px;">
              <p style="margin:0 0 18px;font-size:16px;font-weight:500;">Xin chào ${
                product.detail.sellerId.fullName
              },</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">Bạn có một câu hỏi mới về sản phẩm <strong style="color:#0ea5e9;">${
                product.detail.name
              }</strong>.</p>

              <!-- Question Box -->
              <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Người hỏi</span>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0369a1;">${
                    sender?.fullName || "Người dùng"
                  }</p>
                </div>
                <div>
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Câu hỏi</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${message}</p>
                </div>
              </div>

              <p style="margin:24px 0 20px;font-size:14px;color:#4b5563;">Vui lòng trả lời câu hỏi để khách hàng có thêm thông tin về sản phẩm của bạn.</p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="${productLink}" style="background:#0ea5e9;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:50px;display:inline-block;box-shadow:0 4px 10px rgba(14,165,233,0.35);letter-spacing:.5px;">
                  Xem chi tiết sản phẩm
                </a>
                <p style="margin:14px 0 0;font-size:11px;color:#64748b;">Hoặc sao chép link: <a href="${productLink}" style="color:#0ea5e9;text-decoration:none;">${productLink}</a></p>
              </div>

              <p style="margin:34px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Auctify Team</p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Bạn gặp vấn đề? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#0ea5e9;text-decoration:none;font-weight:600;">auctify.onlineauction@gmail.com</a></p>
              <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
            </div>
          </div>
        </div>
        `;

        // Gửi email bất đồng bộ
        sendEmail(product.detail.sellerId.email, subject, htmlMessage).catch(
          console.error
        );
      }

      await product.populate("chat.sendId", "fullName");

      return product.chat.filter((chat) => chat.type === "public");
    } catch (error) {
      throw new Error("Error adding question: " + error.message);
    }
  }

  // chat in product PrivateChat between highest bidder and seller
  static async addPrivateChat(productId, sendId, message, type = "private") {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName email")
        .populate("auction.highestBidderId", "fullName email");

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.auction.status !== "pending") {
        throw new Error("Private chat only available during pending status.");
      }

      const isSeller =
        product.detail.sellerId._id.toString() === sendId.toString();

      const isHighestBidder =
        product.auction.highestBidderId &&
        product.auction.highestBidderId._id.toString() === sendId.toString();

      if (!isSeller && !isHighestBidder) {
        throw new Error(
          "Unauthorized: Only the seller or highest bidder can chat privately"
        );
      }

      const sender = await User.findById(sendId).select("fullName").exec();

      product.chat.push({
        type,
        sendId,
        message,
        time: new Date(),
        reply: {},
      });

      await product.save();

      // Gửi email cho người nhận (không phải người gửi)
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const productLink = `${clientUrl}/details/${productId}`;

      let recipientEmail = "";
      let recipientName = "";

      if (isSeller) {
        // Người gửi là seller → gửi cho highest bidder
        recipientEmail = product.auction.highestBidderId.email;
        recipientName = product.auction.highestBidderId.fullName;
      } else {
        // Người gửi là highest bidder → gửi cho seller
        recipientEmail = product.detail.sellerId.email;
        recipientName = product.detail.sellerId.fullName;
      }

      if (recipientEmail) {
        const subject = `Bạn có 1 tin nhắn mới về sản phẩm "${product.detail.name}"`;

        const htmlMessage = `
        <div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#1f2937;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#06b6d4,#0891b2);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
              <p style="margin:8px 0 0;font-size:13px;font-weight:500;color:#cffafe;letter-spacing:1px;text-transform:uppercase;">Tin nhắn riêng tư</p>
            </div>

            <!-- Body -->
            <div style="padding:38px 40px 30px;">
              <p style="margin:0 0 18px;font-size:16px;font-weight:500;">Xin chào ${recipientName},</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">Bạn có một tin nhắn mới về sản phẩm <strong style="color:#06b6d4;">${
                product.detail.name
              }</strong>.</p>

              <!-- Message Box -->
              <div style="background:#ecfeff;border-left:4px solid #06b6d4;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Từ</span>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0891b2;">${
                    sender?.fullName || "Người dùng"
                  }</p>
                </div>
                <div>
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Tin nhắn</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${message}</p>
                </div>
              </div>

              <p style="margin:24px 0 20px;font-size:14px;color:#4b5563;">Nhấn vào nút bên dưới để xem chi tiết và trả lời tin nhắn.</p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="${productLink}" style="background:#06b6d4;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:50px;display:inline-block;box-shadow:0 4px 10px rgba(6,182,212,0.35);letter-spacing:.5px;">
                  Xem chi tiết & Trả lời
                </a>
                <p style="margin:14px 0 0;font-size:11px;color:#64748b;">Hoặc sao chép link: <a href="${productLink}" style="color:#06b6d4;text-decoration:none;">${productLink}</a></p>
              </div>

              <div style="background:#fef3c7;border:1px solid #fbbf24;padding:14px 16px;border-radius:10px;font-size:12px;color:#92400e;line-height:1.5;">
                💬 <strong>Lưu ý:</strong> Đây là tin nhắn riêng tư chỉ có bạn và ${
                  isSeller ? "người đấu giá cao nhất" : "người bán"
                } mới xem được.
              </div>

              <p style="margin:34px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Auctify Team</p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Bạn gặp vấn đề? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#06b6d4;text-decoration:none;font-weight:600;">auctify.onlineauction@gmail.com</a></p>
              <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
            </div>
          </div>
        </div>
        `;

        // Gửi email bất đồng bộ
        sendEmail(recipientEmail, subject, htmlMessage).catch(console.error);
      }

      await product.populate("chat.sendId", "fullName");

      return product.chat.filter((chat) => chat.type === "private");
    } catch (error) {
      throw new Error("Error adding question: " + error.message);
    }
  }

  // add reply to a question
  static async addReply(productId, chatId, sellerId, message) {
    try {
      const product = await Product.findById(productId)
        .populate("detail.sellerId", "fullName")
        .populate("auctionHistory.historyList.bidderId", "fullName email")
        .populate("chat.sendId", "fullName email");

      if (!product) {
        throw new Error("Product not found");
      }

      // Verify seller
      if (product.detail.sellerId._id.toString() !== sellerId.toString()) {
        throw new Error("Unauthorized: Only the seller can add replies");
      }

      const chat = product.chat.id(chatId);
      if (!chat) {
        throw new Error("Chat not found");
      }

      if (chat.reply && chat.reply.message) {
        throw new Error("Reply already exists for this question");
      }

      chat.reply = {
        message,
        time: new Date(),
      };

      await product.save();

      // phan gui email thong bao nguoi dau gia va nguoi hoi
      const emailSet = new Set();

      if (product.auctionHistory?.historyList) {
        product.auctionHistory.historyList.forEach((bid) => {
          if (bid.bidderId?.email) {
            emailSet.add(bid.bidderId.email);
          }
        });
      }

      product.chat.forEach((c) => {
        if (c.type === "public" && c.sendId?.email) {
          emailSet.add(c.sendId.email);
        }
      });

      const sellerEmail = await User.findById(sellerId).select("email").exec();
      const askerEmail = chat.sendId;

      if (sellerEmail?.email) {
        emailSet.delete(sellerEmail.email);
      }

      if (askerEmail?.email) {
        emailSet.delete(askerEmail.email);
      }

      if (emailSet.size > 0) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const productLink = `${clientUrl}/details/${productId}`;

        const subject = `Câu hỏi về sản phẩm "${product.detail.name}" đã được trả lời`;

        const htmlMessage = `
        <div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#1f2937;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
              <p style="margin:8px 0 0;font-size:13px;font-weight:500;color:#e0f2fe;letter-spacing:1px;text-transform:uppercase;">Câu trả lời mới</p>
            </div>

            <!-- Body -->
            <div style="padding:38px 40px 30px;">
              <p style="margin:0 0 18px;font-size:16px;font-weight:500;">Xin chào,</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">Người bán đã trả lời câu hỏi về sản phẩm <strong style="color:#0ea5e9;">${product.detail.name}</strong>.</p>

              <!-- Question Box -->
              <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Câu hỏi</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${chat.message}</p>
                </div>
              </div>

              <!-- Answer Box -->
              <div style="background:#ecfeff;border-left:4px solid #06b6d4;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Người bán trả lời</span>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0891b2;">${product.detail.sellerId.fullName}</p>
                </div>
                <div>
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Câu trả lời</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${message}</p>
                </div>
              </div>

              <p style="margin:24px 0 20px;font-size:14px;color:#4b5563;">Nhấn vào nút bên dưới để xem chi tiết sản phẩm và các câu hỏi khác.</p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="${productLink}" style="background:#0ea5e9;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:50px;display:inline-block;box-shadow:0 4px 10px rgba(14,165,233,0.35);letter-spacing:.5px;">
                  Xem chi tiết sản phẩm
                </a>
                <p style="margin:14px 0 0;font-size:11px;color:#64748b;">Hoặc sao chép link: <a href="${productLink}" style="color:#0ea5e9;text-decoration:none;">${productLink}</a></p>
              </div>

              <p style="margin:34px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Auctify Team</p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Bạn gặp vấn đề? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#0ea5e9;text-decoration:none;font-weight:600;">auctify.onlineauction@gmail.com</a></p>
              <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
            </div>
          </div>
        </div>
        `;

        // Gửi email cho từng người (bất đồng bộ)
        const emailArray = Array.from(emailSet);
        emailArray.forEach((email) => {
          sendEmail(email, subject, htmlMessage).catch((error) => {
            console.error(`Failed to send email to ${email}:`, error);
          });
        });
      }

      // Gui rieng cho nguoi hoi
      if (askerEmail?.email) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const productLink = `${clientUrl}/details/${productId}`;

        const subject = `Câu hỏi của bạn về sản phẩm "${product.detail.name}" đã được trả lời`;

        const htmlMessage = `
        <div style="background:#f4f7f9;padding:32px 12px;font-family:Helvetica,Arial,sans-serif;line-height:1.55;color:#1f2937;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:28px 24px;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.5px;color:#ffffff;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Auctify</h1>
              <p style="margin:8px 0 0;font-size:13px;font-weight:500;color:#e0f2fe;letter-spacing:1px;text-transform:uppercase;">Câu trả lời mới</p>
            </div>

            <!-- Body -->
            <div style="padding:38px 40px 30px;">
              <p style="margin:0 0 18px;font-size:16px;font-weight:500;">Xin chào,</p>
              <p style="margin:0 0 20px;font-size:15px;color:#374151;">Người bán đã trả lời câu hỏi của bạn về sản phẩm <strong style="color:#0ea5e9;">${product.detail.name}</strong>.</p>

              <!-- Question Box -->
              <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Câu hỏi</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${chat.message}</p>
                </div>
              </div>

              <!-- Answer Box -->
              <div style="background:#ecfeff;border-left:4px solid #06b6d4;padding:20px 18px;border-radius:8px;margin:24px 0;">
                <div style="margin-bottom:12px;">
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Người bán trả lời</span>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0891b2;">${product.detail.sellerId.fullName}</p>
                </div>
                <div>
                  <span style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Câu trả lời</span>
                  <p style="margin:6px 0 0;font-size:15px;color:#1f2937;line-height:1.6;">${message}</p>
                </div>
              </div>

              <p style="margin:24px 0 20px;font-size:14px;color:#4b5563;">Nhấn vào nút bên dưới để xem chi tiết sản phẩm và các câu hỏi khác.</p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="${productLink}" style="background:#0ea5e9;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;padding:14px 32px;border-radius:50px;display:inline-block;box-shadow:0 4px 10px rgba(14,165,233,0.35);letter-spacing:.5px;">
                  Xem chi tiết sản phẩm
                </a>
                <p style="margin:14px 0 0;font-size:11px;color:#64748b;">Hoặc sao chép link: <a href="${productLink}" style="color:#0ea5e9;text-decoration:none;">${productLink}</a></p>
              </div>

              <p style="margin:34px 0 6px;font-size:13px;color:#6b7280;">Trân trọng,</p>
              <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Auctify Team</p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">Bạn gặp vấn đề? Liên hệ <a href="mailto:auctify.onlineauction@gmail.com" style="color:#0ea5e9;text-decoration:none;font-weight:600;">auctify.onlineauction@gmail.com</a></p>
              <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">© 2025 Auctify. All rights reserved.</p>
            </div>
          </div>
        </div>
        `;

        // Gửi email bất đồng bộ
        sendEmail(askerEmail.email, subject, htmlMessage).catch((error) => {
          console.error(`Failed to send email to ${askerEmail.email}:`, error);
        });
      }

      await product.populate("chat.sendId", "fullName");

      return product.chat;
    } catch (error) {
      throw new Error("Error adding reply: " + error.message);
    }
  }

  // Get product public Q&A
  static async getProductPublicQA(productId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }
      const publicChats = product.chat.filter((chat) => chat.type === "public");

      return publicChats;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
    }
  }

  // Get product private Q&A
  static async getProductPrivateQA(productId, userId) {
    try {
      const product = await Product.findById(productId)
        .populate("chat.sendId", "fullName")
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      // Check if auction has ended bidding (aka: pending, ended, cancelled)
      const endAuction = product.auction.status !== "active";

      if (!endAuction) {
        throw new Error(
          "Auction is still active. Private Q&A not available yet."
        );
      }

      const isHighestBidder =
        product.auction.highestBidderId &&
        product.auction.highestBidderId.toString() === userId;

      const isSeller = product.detail.sellerId.toString() === userId;

      if (!isHighestBidder && !isSeller) {
        throw new Error(
          "Unauthorized: Only the highest bidder or seller can access private Q&A"
        );
      }

      const privateChats = product.chat.filter(
        (chat) => chat.type === "private"
      );

      return privateChats;
    } catch (error) {
      throw new Error("Error getting product Q&A: " + error.message);
    }
  }

  // get product auction history
  static async getAuctionHistory(productId, page = 1, limit = 10) {
    try {
      const product = await Product.findById(productId)
        .select("auction auctionHistory")
        .populate("auctionHistory.historyList.bidderId", "fullName")
        .lean() // chi thuan doc data va tra ve object thuong cho nhe
        .exec();

      if (!product) {
        throw new Error("Product not found");
      }

      // get current price
      const currentHighestPrice = product.auction.currentPrice;

      // sort historyList by bidTime descending and limit results (default 20)
      let historyList = product.auctionHistory?.historyList || [];
      historyList.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));

      // pagination
      const totalItems = historyList.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedHistory = historyList.slice(startIndex, endIndex);

      const processedHistory = paginatedHistory.map((bid) => {
        const displayBid = { ...bid };

        if (displayBid.bidPrice > currentHighestPrice) {
          displayBid.bidPrice = currentHighestPrice;
        }
        return displayBid;
      });

      return {
        numberOfBids: product.auctionHistory.numberOfBids,
        historyList: processedHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error("Error getting auction history: " + error.message);
    }
  }

  // create product (with optional uploaded images)
  static async createProduct(payload, files, userId) {
    function getPublicId(url) {
      const parts = url.split("products/");
      if (parts.length < 2) return null;

      const rest = parts[1]; // "692be247386a087837e12afe/1764483664931_2.png"
      const withoutExt = rest.replace(/\.[^/.]+$/, ""); // bỏ .png

      return "products/" + withoutExt;
    }

    // --- VALIDATION ---
    if (!payload.endDate) throw new Error("endDate is required");

    const endTimeParsed = Date.parse(payload.endDate);
    if (isNaN(endTimeParsed)) throw new Error("Invalid endDate format");

    const startPriceVal = Number(payload.startingPrice || payload.startPrice);
    const stepPriceVal = Number(payload.step || payload.stepPrice);

    if (!startPriceVal || startPriceVal <= 0)
      throw new Error("Invalid starting price");

    if (!stepPriceVal || stepPriceVal <= 0)
      throw new Error("Invalid step price");

    if (!payload.productName && !payload.name)
      throw new Error("Product name is required");

    if (
      !payload.category &&
      !(payload.category && payload.category.name) &&
      !payload.categoryName
    )
      throw new Error("Category is required");

    if (
      !payload.subcategory &&
      !(payload.subcategory && payload.subcategory.name) &&
      !payload.subCategory
    )
      throw new Error("Subcategory is required");

    // --- BUILD DETAIL + AUCTION ---
    const detail = {
      sellerId: userId,
      name: payload.productName || payload.name || "(No name)",
      category: payload.category,
      subCategory: payload.subcategory,
      description: payload.description || "",
      images: [],
    };

    const auction = {
      startPrice: startPriceVal,
      stepPrice: stepPriceVal,
      buyNowPrice: Number(payload.buyNowPrice) || null,
      currentPrice: Number(payload.startingPrice) || null,
      highestBidderId: null,
      startTime: payload.startTime ? new Date(payload.startTime) : new Date(),
      endTime: payload.endDate ? new Date(payload.endDate) : null,
      autoExtend: payload.autoExtend || false,
      allowNewBidders: payload.allowNewBidders || false,
      status:
        payload.startTime && new Date(payload.startTime) > new Date()
          ? "pending"
          : "active",
    };

    const newProduct = new Product({ detail, auction });
    await newProduct.save();

    // --- HANDLE IMAGES ---
    if (Array.isArray(files) && files.length > 0) {
      const uploadPromises = files.map((file, index) =>
        uploadImageToCloudinary(file, newProduct._id, index).catch((err) => {
          console.error(`Error uploading image ${index}:`, err);
          return null;
        })
      );

      const uploadedUrls = await Promise.all(uploadPromises);
      newProduct.detail.images = uploadedUrls.filter(Boolean);
      await newProduct.save();
    }

    return newProduct;
  }

  // take 5 ralated products from the same subcategory, if not enough, finding more in category, if still not enough, fiding more from current seller, if still not enough, finding any active products
  static async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await Product.findById(productId);

      if (!product) {
        throw new Error("Product not found");
      }

      let relatedProducts = [];

      // same subcategory
      relatedProducts = await Product.find({
        _id: { $ne: productId },
        "detail.subCategory": product.detail.subCategory,
        "auction.status": "active",
      })
        .limit(limit)
        .select(
          "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
        )
        .populate("auction.highestBidderId", "fullName")
        .exec();

      // same category
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const categoryProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "detail.category": product.detail.category,
          "detail.subCategory": { $ne: product.detail.subCategory },
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...categoryProducts];
      }

      // same seller
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const sellerProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "detail.sellerId": product.detail.sellerId,
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...sellerProducts];
      }

      // any active products
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const activeProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
          "auction.status": "active",
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...activeProducts];
      }

      // if still not enough, return whatever found
      if (relatedProducts.length < limit) {
        const remaining = limit - relatedProducts.length;
        const existingIds = relatedProducts.map((p) => p._id);

        const randomProducts = await Product.find({
          _id: { $ne: productId, $nin: existingIds },
        })
          .limit(remaining)
          .select(
            "detail.name detail.images auction.currentPrice auction.buyNowPrice auction.startTime auction.endTime auction.highestBidderId auctionHistory.numberOfBids"
          )
          .populate("auction.highestBidderId", "fullName")
          .exec();

        relatedProducts = [...relatedProducts, ...randomProducts];
      }

      const formattedProducts = relatedProducts.map((p) => {
        const bidderInfo = p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice,
          buyNowPrice: p.auction.buyNowPrice,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.auction.startTime || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory?.numberOfBids || 0,
        };
      });

      return formattedProducts;
    } catch (error) {
      throw new Error("Error getting related products: " + error.message);
    }
  }

  static async getFirstProducts({
    page = 1,
    limit = 5,
    sortBy = "",
    search = "",
  }) {
    try {
      let products;
      let totalItems;

      // Use aggregation pipeline for both search and non-search cases
      const pipeline = [];

      // Add $search stage only if search query exists
      if (search && search.trim()) {
        pipeline.push({
          $search: {
            index: "product_name",
            text: {
              query: search,
              path: "detail.name",
            },
          },
        });
      }

      // Filter non-ended products for mostBids and highestPrice
      if (
        sortBy === "mostBids" ||
        sortBy === "highestPrice" ||
        sortBy === "endingSoon"
      ) {
        pipeline.push({
          $match: {
            "auction.endTime": { $gt: new Date() },
          },
        });
      }

      // Add calculated field and sorting
      if (sortBy === "endTime") {
        pipeline.push({
          $sort: { "auction.endTime": -1, "auction.startTime": -1 },
        });
      } else if (sortBy === "priceAsc") {
        pipeline.push({
          $sort: { "auction.currentPrice": 1, "auction.startTime": -1 },
        });
      } else if (sortBy === "endingSoon") {
        pipeline.push({ $sort: { "auction.endTime": 1 } });
      } else if (sortBy === "mostBids") {
        pipeline.push({
          $sort: { "auctionHistory.numberOfBids": -1, "auction.endTime": -1 },
        });
      } else if (sortBy === "highestPrice") {
        pipeline.push({
          $sort: { "auction.currentPrice": -1, "auction.endTime": -1 },
        });
      } else {
        pipeline.push({ $sort: { "auction.startTime": -1 } });
      }

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Product.aggregate(countPipeline).exec();
      totalItems = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Lookup to populate fields
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "detail.sellerId",
          foreignField: "_id",
          as: "sellerInfo",
        },
      });
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "auction.highestBidderId",
          foreignField: "_id",
          as: "bidderInfo",
        },
      });

      products = await Product.aggregate(pipeline).exec();

      const formatted = products.map((p) => {
        const sellerInfo = p.sellerInfo?.[0] || p.detail?.sellerId;
        const bidderInfo = p.bidderInfo?.[0] || p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice || p.auction.startPrice || 0,
          buyNowPrice: p.auction.buyNowPrice || null,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.createdAt || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory.numberOfBids || 0,
        };
      });

      return {
        products: formatted,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          limit: parseInt(limit),
        },
      };
    } catch (error) {
      throw new Error("Error getting products: " + error.message);
    }
  }

  static async getProductsByCategory({
    category,
    subcategory,
    page = 1,
    limit = 0,
    sortBy = "",
    search = "",
  }) {
    try {
      let products;
      let totalItems;

      // Use aggregation pipeline for both search and non-search cases
      const pipeline = [];

      // Add $search stage only if search query exists
      if (search && search.trim()) {
        pipeline.push({
          $search: {
            index: "product_name",
            text: {
              query: search,
              path: "detail.name",
            },
          },
        });
      }

      // Add category filter
      pipeline.push({
        $match: {
          "detail.category":
            mongoose.Types.ObjectId.createFromHexString(category),
          ...(subcategory && {
            "detail.subCategory":
              mongoose.Types.ObjectId.createFromHexString(subcategory),
          }),
        },
      });

      // Add calculated field and sorting
      if (sortBy === "endTime") {
        pipeline.push({
          $sort: { "auction.endTime": -1, "auction.startTime": -1 },
        });
      } else if (sortBy === "priceAsc") {
        pipeline.push({
          $sort: { "auction.currentPrice": 1, "auction.startTime": -1 },
        });
      } else {
        pipeline.push({ $sort: { "auction.startTime": -1 } });
      }

      // Count total before pagination
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await Product.aggregate(countPipeline).exec();
      totalItems = countResult[0]?.total || 0;

      // Add pagination
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });

      // Lookup to populate highestBidderId
      pipeline.push({
        $lookup: {
          from: "users",
          localField: "auction.highestBidderId",
          foreignField: "_id",
          as: "bidderInfo",
        },
      });

      products = await Product.aggregate(pipeline).exec();

      const formatted = products.map((p) => {
        const bidderInfo = p.bidderInfo?.[0] || p.auction?.highestBidderId;

        return {
          id: p._id,
          name: p.detail.name,
          image: p.detail.images?.[0] || null,
          currentPrice: p.auction.currentPrice,
          buyNowPrice: p.auction.buyNowPrice,
          highestBidder: bidderInfo?.fullName || null,
          postedDate: p.auction.startTime || null,
          endDate: p.auction.endTime || null,
          bidCount: p.auctionHistory.numberOfBids,
        };
      });

      return {
        products: formatted,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalItems / limit),
          totalItems: totalItems,
          limit: parseInt(limit),
        },
      };
    } catch (err) {
      throw new Error("Error getting products: " + err.message);
    }
  }

  // Utility function to upload single image to Cloudinary with custom folder
  static async uploadImageToCloudinaryCustomFolder({
    file,
    baseFolder,
    orderId = null,
    index = 0,
  }) {
    // Build folder path: baseFolder/orderId or just baseFolder
    const folderPath = orderId ? `${baseFolder}/${orderId}` : baseFolder;

    // If already uploaded (has path/location/url)
    if (file.path || file.location || file.url) {
      return file.path || file.location || file.url;
    }

    // Upload buffer to Cloudinary
    if (file.buffer) {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: folderPath,
        public_id: `${Date.now()}_${index}`,
        quality: "auto",
        fetch_format: "auto",
        transformation: [{ width: 1800, height: 1800, crop: "limit" }],
      });

      if (result?.secure_url || result?.url) {
        return result.secure_url || result.url;
      }
    }

    return null;
  }

  // Cách dùng:
  // Gọi 4 dòng dưới đây trong mấy chỗ cần xóa folder trên Cloudinary
  // const folder = 'folder_name_to_delete';
  // const result = await ProductService.deleteCloudinaryFolder(
  //   `products/${folder}`
  // );

  // Utility function to delete a folder on Cloudinary
  static async deleteCloudinaryFolder(folderPath) {
    try {
      // Delete all resources in the folder
      const deleteResult = await cloudinary.api.delete_resources_by_prefix(
        folderPath,
        {
          resource_type: "image",
        }
      );

      // Delete the folder itself
      await cloudinary.api.delete_folder(folderPath);

      return {
        success: true,
        deletedCount: deleteResult.deleted
          ? Object.keys(deleteResult.deleted).length
          : 0,
        message: `Folder '${folderPath}' deleted successfully`,
      };
    } catch (error) {
      console.error(`Error deleting folder ${folderPath}:`, error);
      return {
        success: false,
        message: `Failed to delete folder: ${error.message}`,
      };
    }
  }
}

module.exports = ProductService;
