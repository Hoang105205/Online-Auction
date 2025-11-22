// --- Load environment variables ---
require("dotenv").config();

// --- Express Setup & Middleware ---
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport"); 

// Cấu hình CORS
const CORS_OPTIONS = require("./config/cors");
app.use(cors(CORS_OPTIONS));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); // Sử dụng cookie-parser

// Khởi động Passport
app.use(passport.initialize());

// --- Kết nối Database ---
const mongoose = require("mongoose");
const connectDB = require("./config/db");
connectDB();

// --- Routes ---
app.use("/api/auth", require("./routes/AuthRoute")); 

// --- Middleware Xử lý Lỗi Cuối cùng ---
app.use((req, res) => {
  res.status(404).json({ message: "Không tìm thấy tài nguyên." });
})

// --- Lắng nghe kết nối DB và khởi động server ---
const PORT = process.env.PORT || 3000;

mongoose.connection.once("open", () => {
  console.log("Đã kết nối đến Database.");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
