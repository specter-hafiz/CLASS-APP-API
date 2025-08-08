const User = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/hash");
const AppError = require("../errors/appError");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary_config");
const getPublicIdFromUrl = require("../utils/getPublicIdFromUrl");
const {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
} = require("../utils/jwt");
const { sendOtpToEmail } = require("./otpService");

const signup = async ({ email, password, name }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashedPassword = await hashPassword(password);
  const user = new User({ email, password: hashedPassword, name });
  console.log(user);
  await sendOtpToEmail(user);
  return user.email;
};

const handleTokenRefresh = async (refreshToken) => {
  if (!refreshToken) {
    throw { status: 401, message: "Refresh token required" };
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 403, message: "Invalid or expired refresh token" };
  }

  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    throw { status: 403, message: "Invalid refresh token" };
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");
  if (!user.isVerified) {
    await sendOtpToEmail(user);
    throw new AppError(
      "User not verified. Please check your email for the OTP.",
      399
    );
  }
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  await user.save();
  const userToSend = user.toObject();
  delete userToSend.password;
  delete userToSend.otp;
  delete userToSend.otpExpires;

  return { user: userToSend };
};

const googleLogin = async ({ email, name, googleId }) => {
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, name, googleId, verified: true });
    await user.save();
  }
  const token = signAccessToken(user);
  return { token, user };
};

const forgotPassword = async (email) => {
  console.log(`Sending OTP to email: ${email}`);
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email not found");
  if (user.otpExpires && user.otpExpires > Date.now()) {
    return user.email; // OTP already sent, return email without sending again
  }
  await sendOtpToEmail(user);
  return email;
};

const verifyOtp = async ({ email, otp }) => {
  const user = await User.findOne({ email, otp });
  if (!user || user.otpExpires < Date.now()) {
    throw new Error("Invalid or expired OTP");
  }
  user.isVerified = true;
  user.otp = null;
  user.otpExpires = null;
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshToken = refreshToken;
  delete user.password;
  delete user.otp;
  delete user.otpExpires;
  await user.save();

  return { succes: true, accessToken, refreshToken, user };
};

const resetPassword = async ({ email, newPassword }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.otp) {
    throw new Error("Please verify your OTP before resetting the password");
  }
  user.password = await hashPassword(newPassword);
  await user.save();
  return true;
};

const editProfile = async (userId, updates) => {
  console.log(`Editing profile for user ID: ${userId}`);
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error("User not found");
  const userToSend = user.toObject();
  delete userToSend.password;
  delete userToSend.otp;
  delete userToSend.otpExpires;
  return userToSend;
};

const resendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  if (user.otpExpires && user.otpExpires > Date.now()) {
    throw new Error(
      "OTP already sent. Please wait before requesting a new one."
    );
  }
  await sendOtpToEmail(user);
  return true;
};

const changePassword = async ({ userId, oldPassword, newPassword }) => {
  console.log(`Changing password for user ID: ${userId}`);
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const match = await comparePassword(oldPassword, user.password);
  if (!match) throw new Error("Old password is incorrect");

  user.password = await hashPassword(newPassword);
  await user.save();
  console.log("Password changed successfully for user:", userId);
  return true;
};

const uploadProfileImage = async (userId, file) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already has a profile image
  if (user.profileUrl) {
    // Extract public_id from the URL to delete the image
    const publicId = getPublicIdFromUrl(user.profileUrl);
    if (publicId) {
      console.log(`Deleting old image from Cloudinary: ${publicId}`);
      await deleteFromCloudinary(publicId);
      console.log(`Deleted old image from Cloudinary: ${publicId}`);
    }
  }

  // Upload new image
  const url = await uploadToCloudinary(file.buffer);
  user.profileUrl = url;
  console.log(`Profile image uploaded for user ID: ${userId}, URL: ${url}`);
  await user.save();
  return url;
};

module.exports = {
  signup,
  login,
  googleLogin,
  editProfile,
  uploadProfileImage,
  forgotPassword,
  handleTokenRefresh,
  verifyOtp,
  resendOtp,
  resetPassword,
  changePassword,
};
