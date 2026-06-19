import rateLimit from "express-rate-limit";

// Install: npm install express-rate-limit

const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
    retryAfter: res.getHeader("Retry-After"),
  });
};

// Sabhi routes par — 15 min mein 200 requests
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many requests. Please slow down."),
});

// Login / Register — 15 min mein 10 attempts (sirf failed count hoti hain)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: rateLimitHandler(
    "Too many attempts. Please wait 15 minutes and try again."
  ),
});

// Refresh token — 15 min mein 15 requests
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Too many token refresh requests. Please login again."
  ),
});

// OTP verify / resend — 10 min mein 5 requests
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler("Too many OTP requests. Please wait 10 minutes."),
});

// Forgot / Reset password — 1 hour mein 3 requests
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler(
    "Too many password reset attempts. Please wait 1 hour."
  ),
});   
 