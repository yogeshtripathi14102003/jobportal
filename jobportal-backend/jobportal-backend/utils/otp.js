import crypto from "crypto";

// ─── Existing functions (already in your file) ────────────────────────────────
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000); // 10 min

// ─── NEW: Password reset token ────────────────────────────────────────────────
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
  return { rawToken, hashedToken, expiry };
};