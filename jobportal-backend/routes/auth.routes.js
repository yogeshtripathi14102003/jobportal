import { Router } from "express";
import * as AuthController from "../controllers/authcontroller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  validate,
  registerValidators,
  loginValidators,
  otpValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
} from "../middlewares/validate.middleware.js";
import { body } from "express-validator";
import {
  authLimiter,
  refreshLimiter,
  otpLimiter,
  passwordResetLimiter,
} from "../config/rateLimiter.js";

const router = Router();

// ── Public routes ──────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,           // ← 15 min mein max 10 failed attempts
  registerValidators,
  validate,
  AuthController.register
);

// POST /api/auth/verify-otp
router.post(
  "/verify-otp",
  otpLimiter,            // ← 10 min mein max 5 requests
  otpValidators,
  validate,
  AuthController.verifyOtp
);

// POST /api/auth/resend-otp
router.post(
  "/resend-otp",
  otpLimiter,            // ← same OTP limiter
  [body("email").normalizeEmail().isEmail().withMessage("Valid email required")],
  validate,
  AuthController.resendOtp
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,           // ← 15 min mein max 10 failed attempts
  loginValidators,
  validate,
  AuthController.login
);

// POST /api/auth/refresh
router.post(
  "/refresh",
  refreshLimiter,        // ← 15 min mein max 15 requests (race condition abuse se bachao)
  AuthController.refreshTokens
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  passwordResetLimiter,  // ← 1 hour mein max 3 requests
  forgotPasswordValidators,
  validate,
  AuthController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  passwordResetLimiter,  // ← same limiter (forgot + reset dono milake 3)
  resetPasswordValidators,
  validate,
  AuthController.resetPassword
);

// ── Protected routes ───────────────────────────────────────────────────────────

// POST /api/auth/logout
router.post("/logout", protect, AuthController.logout);

// GET /api/auth/me
router.get("/me", protect, AuthController.getMe);

// PATCH /api/auth/change-password
router.patch(
  "/change-password",
  protect,
  changePasswordValidators,
  validate,
  AuthController.changePassword
);

export default router;