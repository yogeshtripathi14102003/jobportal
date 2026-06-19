import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { sendError } from "../utils/ApiResponse.js";

/**
 * Global Express error-handling middleware.
 * Must have 4 params so Express recognises it as an error handler.
 */
const errorHandler = (err, req, res, next) => {
  // ── Already an ApiError (operational) ────────────────────────────────────
  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, err.message, err.errors);
  }

  // ── Mongoose: duplicate key (e.g. unique email) ───────────────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return sendError(res, 409, `'${value}' is already registered for field '${field}'.`);
  }

  // ── Mongoose: validation error ────────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, 400, "Validation failed", errors);
  }

  // ── Mongoose: bad ObjectId ────────────────────────────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    return sendError(res, 400, `Invalid value for field '${err.path}': '${err.value}'`);
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    return sendError(res, 401, "Invalid token, please login again.");
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, 401, "Token expired, please login again.");
  }

  // ── Unknown / programming error ───────────────────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error("🔴 Unhandled error:", err);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production: don't leak details
  return sendError(res, 500, "Something went wrong. Please try again later.");
};

export default errorHandler;
