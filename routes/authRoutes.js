const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { upload } = require("../config/cloudinary_config");
const {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendOtpSchema,
  changePasswordSchema,
  verifyOtpSchema,
} = require("../validators/authValidator");
const authenticate = require("../middlewares/authMiddleware");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authController.refreshToken
);
router.post("/google-login", authController.googleLogin);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/upload-profile-image",
  authenticate,
  upload.single("image"),
  authController.uploadProfileImage
);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.patch("/edit-profile", authenticate, authController.editProfile);
router.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword
);
router.post("/verify-otp", validate(verifyOtpSchema), authController.verifyOtp);

module.exports = router;
