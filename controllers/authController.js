const { success } = require("zod/v4");
const authService = require("../services/authService");

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
    res.status(400).json({ message: err.message });
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
    const { token, user } = await authService.googleLogin(req.body);
    res.status(200).json({ message: "Google login successful", token, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
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

module.exports = {
  signup,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resendOtp,
  resetPassword,
  changePassword,
  refreshToken,
};
