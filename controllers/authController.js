const { success } = require("zod/v4");
const authService = require("../services/authService");
const AppError = require("../errors/appError");

const signup = async (req, res) => {
  try {
    const response = await authService.signup(req.body);
    res.status(201).json({
      email: response,
      message:
        "User registered successfully. Please check your email for an OTP code to verify your identity.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const response = await authService.login(req.body);
    res.status(200).json({ message: "Login successful", response });
  } catch (err) {
    console.error("Login error:", err.statusCode);
    const statusCode = err.statusCode || 400;
    console.log(err instanceof AppError); // Should be true
    console.log(err instanceof Error);
    res.status(statusCode).json({ message: err.message });
  }
};
const refreshToken = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await authService.handleTokenRefresh(
      req.body.refreshToken
    );
    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { user } = await authService.googleLogin(req.body);
    res.status(200).json({ message: "Google login successful", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = await authService.forgotPassword(req.body.email);
    console.log(`OTP sent to email: ${email}`);
    res.status(200).json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    res.status(400).json({ message: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const results = await authService.verifyOtp(req.body);
    res.status(200).json({ msg: "OTP verified successfully", results });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await authService.editProfile(userId, req.body);
    console.log(`Updated User: ${updatedUser}`); // Debugging line to check updated user
    res

      .status(200)
      .json({ message: "Profile updated successfully", updatedUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    await authService.resendOtp(req.body.email);
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    await authService.changePassword({ userId, ...req.body });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = await authService.uploadProfileImage(userId, file);
    res.status(200).json({ message: "Image uploaded successfully", url });
  } catch (err) {
    console.error("Error uploading profile image:", err);
    res.status(500).json({ message: "Failed to upload image" });
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  uploadProfileImage,
  resendOtp,
  editProfile,
  resetPassword,
  changePassword,
  refreshToken,
};
