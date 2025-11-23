const mongoose = require("mongoose");
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  commenterId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isGood: {
    type: Boolean,
    default: false,
  },
  content: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new Schema(
  {
    roles: {
      type: [Number],
      default: [],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    feedBackAsBidder: {
      type: [feedbackSchema],
      default: [],
    },
    feedBackAsSeller: {
      type: [feedbackSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
