const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Email của bạn
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng (App Password)
      },
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
  }
};

module.exports = sendEmail;
