const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    console.error("❌ KẾT NỐI DATABASE THẤT BẠI:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
