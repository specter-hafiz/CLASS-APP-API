// services/otpService.js

const { sendOTPEmail } = require("../utils/emailSender");
const { generateOTP } = require("../utils/generateOTP");

exports.sendOtpToEmail = async (user) => {
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  await sendOTPEmail(user.email, otp);
};
