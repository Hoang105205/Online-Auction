const User = require("../models/User");

const getUserBasicProfile = async (req, res) => {
  if (!req.user) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(req.user)
      .select("-password -refreshToken -otp -otpExpires -feedBackAsBidder -feedBackAsSeller -isVerified -__v -googleId -createdAt -updatedAt")
      .exec();

    if (!user) {
      return res.status(204).json({ message: "User not found" }); // No Content
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUserBasicProfile };
