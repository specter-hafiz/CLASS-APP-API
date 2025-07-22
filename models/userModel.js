const mongoose = require("mongoose");
const { refreshToken } = require("../controllers/authController");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  name: String,
  googleId: String,
  role: { type: String, enum: ["user", "owner"], default: "user" },
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  refreshToken: String,
  accessToken: String,
});

module.exports = mongoose.model("User", userSchema);
