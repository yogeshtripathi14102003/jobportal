import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { generateOTP, otpExpiry, generateResetToken } from "../utils/otp.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/email.js";
// ─── Token helpers ────────────────────────────────────────────────────────────
const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerUser = async ({ name, email, password, role, phone, address, dob, fatherName }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict(`Email '${email}' is already registered.`);

  const otp = generateOTP();
  const expiry = otpExpiry();

  const user = await User.create({
    name, email, password, role: role || "student",
    phone, address, dob, fatherName,
    otp, otpExpiry: expiry, isVerified: false,
  });

  // Fire-and-forget OTP email (don't fail registration if SMTP is not set up)
  sendOtpEmail(email, otp).catch((e) => console.warn("OTP email failed:", e.message));

  return user;
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtp = async (email, otp) => {
  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) throw ApiError.notFound("User not found.");
  if (user.isVerified) throw ApiError.badRequest("Account already verified.");
  if (!user.otp || user.otp !== otp) throw ApiError.badRequest("Invalid OTP.");
  if (!user.otpExpiry || user.otpExpiry < new Date()) throw ApiError.badRequest("OTP has expired. Request a new one.");

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return user;
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
export const resendOtp = async (email) => {
  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) throw ApiError.notFound("User not found.");
  if (user.isVerified) throw ApiError.badRequest("Account already verified.");

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpiry = otpExpiry();
  await user.save();

  sendOtpEmail(email, otp).catch((e) => console.warn("OTP email failed:", e.message));
  return { message: "OTP resent successfully." };
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw ApiError.unauthorized("Invalid email or password.");
  if (!(await user.comparePassword(password))) throw ApiError.unauthorized("Invalid email or password.");
  if (user.status === "blocked") throw ApiError.forbidden("Account blocked. Contact admin.");
  if (!user.isVerified) throw ApiError.forbidden("Please verify your email before logging in.");

  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken, user };
};

// ─── Refresh tokens ───────────────────────────────────────────────────────────
export const refreshTokens = async (incomingRefresh) => {
  if (!incomingRefresh) throw ApiError.unauthorized("Refresh token missing.");
  let decoded;
  try {
    decoded = jwt.verify(incomingRefresh, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token.");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== incomingRefresh) {
    throw ApiError.unauthorized("Refresh token mismatch. Please login again.");
  }

  const accessToken = signAccess(user._id);
  const refreshToken = signRefresh(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const forgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Security: email exist kare ya na kare — same response do
  // (attacker ko pata nahi chalega ki email registered hai ya nahi)
  if (!user) return { message: "If this email is registered, a reset link has been sent." };

  if (user.status === "blocked") {
    throw ApiError.forbidden("Account blocked. Contact admin.");
  }

  const { rawToken, hashedToken, expiry } = generateResetToken();

  // Hashed token DB mein store karo
  user.passwordResetToken = hashedToken;
  user.passwordResetExpiry = expiry;
  await user.save({ validateBeforeSave: false });

  // Raw token URL mein bhejo (DB mein kabhi nahi)
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(email, {
    name: user.name,
    resetUrl,
  }).catch((e) => {
    // Email fail ho toh token DB se hata do
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.save({ validateBeforeSave: false });
    console.warn("Reset email failed:", e.message);
    throw ApiError.internal("Email could not be sent. Try again later.");
  });

  return { message: "If this email is registered, a reset link has been sent." };
};

// ─── Reset Password — token verify + new password save ────────────────────────
export const resetPassword = async (rawToken, newPassword) => {
  // Raw token ko hash karo — DB se match karne ke liye
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() }, // expired nahi hona chahiye
  }).select("+passwordResetToken +passwordResetExpiry");

  if (!user) {
    throw ApiError.badRequest("Reset link is invalid or has expired. Please request a new one.");
  }

  // New password set karo
  user.password = newPassword; // pre-save hook hash karega
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;

  // Sab refresh tokens invalidate karo (security)
  user.refreshToken = undefined;

  await user.save();

  return { message: "Password reset successfully. Please login with your new password." };
};

// ─── Change Password (logged-in user) ─────────────────────────────────────────
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found.");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw ApiError.badRequest("Current password is incorrect.");

  if (oldPassword === newPassword) {
    throw ApiError.badRequest("New password must be different from current password.");
  }

  user.password = newPassword; // pre-save hook hash karega
  user.refreshToken = undefined; // logout all devices
  await user.save();

  return { message: "Password changed successfully. Please login again." };
};