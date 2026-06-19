import * as AuthService from "../services/auth.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/ApiResponse.js";

const isProd = process.env.NODE_ENV === "production";

// ─── Cookie options ───────────────────────────────────────────────────────────
// Development: sameSite "none" + secure false
//   → localhost:3000 → localhost:8080 cross-port requests mein cookie jaati hai
// Production:  sameSite "none" + secure true (HTTPS required)
//   → cross-domain cookies ke liye "none" zaroori hai
const cookieOptions = {
  httpOnly: true,
  secure: isProd,                // production mein HTTPS required
  sameSite: isProd ? "none" : "none",  // cross-origin ke liye "none"
  maxAge: 30 * 24 * 60 * 60 * 1000,   // 30 days
};

export const register = asyncHandler(async (req, res) => {
  const user = await AuthService.registerUser(req.body);
  sendSuccess(res, 201, "Registered successfully. Please verify your email with the OTP sent.", { user });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const user = await AuthService.verifyOtp(req.body.email, req.body.otp);
  sendSuccess(res, 200, "Email verified successfully.", { user });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const result = await AuthService.resendOtp(req.body.email);
  sendSuccess(res, 200, result.message);
});

export const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await AuthService.loginUser(
    req.body.email,
    req.body.password
  );
  res.cookie("refreshToken", refreshToken, cookieOptions);
  sendSuccess(res, 200, "Logged in successfully.", { accessToken, user });
});

export const refreshTokens = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
  const tokens = await AuthService.refreshTokens(incoming);
  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);
  sendSuccess(res, 200, "Tokens refreshed.", { accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  await AuthService.logoutUser(req.user._id);
  res.clearCookie("refreshToken", cookieOptions);
  sendSuccess(res, 200, "Logged out successfully.");
});

export const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, "Profile fetched.", { user: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  sendSuccess(res, 200, result.message);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.resetPassword(
    req.body.token,
    req.body.newPassword
  );
  sendSuccess(res, 200, result.message);
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await AuthService.changePassword(
    req.user._id,
    req.body.oldPassword,
    req.body.newPassword
  );
  sendSuccess(res, 200, result.message);
});