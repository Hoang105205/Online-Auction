const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // 1. Khai báo host cụ thể
      port: 587,              // 1. Đổi sang port 587
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // 4. Thêm cấu hình Timeout để tránh lỗi kết nối trên Render
      connectionTimeout: 10000, // 10 giây
      greetingTimeout: 10000,   // 10 giây
      socketTimeout: 10000,     // 10 giây
    });

    await transporter.sendMail({
      from: `"Auctify Support" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email send failed:", error);
    // Có thể throw error ra ngoài nếu muốn controller biết để báo lỗi về client
    // throw error; 
  }
};

module.exports = sendEmail;
