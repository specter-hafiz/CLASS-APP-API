const { z } = require("zod");

// Signup schema
const signupSchema = {
  body: z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

// Login schema
const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
};

// refresh token schema
const refreshTokenSchema = {
  body: z.object({
    accessToken: z.string().min(1, "accessToken is required"),
    refreshToken: z.string().min(1, "refreshToken is required"),
  }),
};

// forgot password schema
const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
};

// reset password schema
const resetPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
};

// resend OTP schema
const resendOtpSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
};

// change password schema
const changePasswordSchema = {
  body: z.object({
    oldPassword: z
      .string()
      .min(6, "Old password must be at least 6 characters"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
  }),
};

// verify OTP schema
const verifyOtpSchema = {
  body: z.object({
    email: z.string().email("Invalid email format"),
    otp: z.string().length(5, "OTP must be exactly 6 characters"),
  }),
};

module.exports = {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  changePasswordSchema,
  verifyOtpSchema,
};
