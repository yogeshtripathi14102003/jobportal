import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * protect – Bearer JWT verify karo aur req.user set karo
 *
 * Security fixes:
 * 1. User-existence errors generic hain (user enumeration se bachao)
 * 2. +refreshToken sirf tab select hoga jab rotation logic ho
 */
export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Authentication required. Please login.");
  }

  const token = authHeader.split(" ")[1];

  // ── JWT Verification ────────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Token expired. Please login again.");
    }
    // TokenExpiredError aur InvalidToken dono ke liye same message
    // (attacker ko exact reason mat batao)
    throw ApiError.unauthorized("Authentication failed. Please login again.");
  }

  // ── User Lookup ─────────────────────────────────────────────────────────────
  // NOTE: +refreshToken yahan SELECT nahi kiya — sirf /refresh route par chahiye.
  // Middleware mein unnecessarily sensitive data req.user mein mat daalo.
  const user = await User.findById(decoded.id);

  if (!user) {
    // "User no longer exists" mat likho — user enumeration hota hai
    throw ApiError.unauthorized("Authentication failed. Please login again.");
  }

  if (user.status === "blocked") {
    throw ApiError.forbidden("Your account has been blocked. Contact admin.");
  }

  if (user.status === "inactive") {
    throw ApiError.forbidden("Your account is inactive.");
  }

  req.user = user;
  next();
});

/**
 * allowRoles(...roles) – Role-based access control
 * protect ke BAAD use karo
 *
 * Usage:
 *   router.delete("/user/:id", protect, allowRoles("admin"), deleteUser);
 *   router.get("/students", protect, allowRoles("admin","subadmin","counsellor"), getStudents);
 */
export const allowRoles = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): [${roles.join(", ")}]. Your role: ${req.user.role}`
      );
    }
    next();
  });

/**
 * verifiedOnly – OTP/email verified user hi aage ja sake
 * protect ke BAAD use karo
 *
 * Usage:
 *   router.get("/profile", protect, verifiedOnly, getProfile);
 */
export const verifiedOnly = asyncHandler(async (req, res, next) => {
  if (!req.user.isVerified) {
    throw ApiError.forbidden("Please verify your email/OTP before continuing.");
  }
  next();
});