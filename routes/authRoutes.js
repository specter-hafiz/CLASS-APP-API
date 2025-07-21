const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { signupSchema, loginSchema } = require("../validators/authValidator");
const authenticate = require("../middlewares/authMiddleware");

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/resend-otp", authController.resendOtp);
router.post("/change-password", authenticate, authController.changePassword);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
