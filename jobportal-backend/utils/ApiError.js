
class ApiError extends Error {
  /**
   * @param {number}   statusCode  HTTP status code
   * @param {string}   message     Human-readable message
   * @param {Array}    errors      Optional field-level validation errors
   * @param {string}   stack       Optional existing stack trace
   */
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;          // e.g. express-validator errors array
    this.isOperational = true;     // flag: we threw this on purpose

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Static factory helpers ───────────────────────────────────────────────

  static badRequest(msg, errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = "Unauthorized") {
    return new ApiError(401, msg);
  }

  static forbidden(msg = "Forbidden – you don't have permission") {
    return new ApiError(403, msg);
  }

  static notFound(msg = "Resource not found") {
    return new ApiError(404, msg);
  }

  static conflict(msg = "Resource already exists") {
    return new ApiError(409, msg);
  }

  static tooMany(msg = "Too many requests, try again later") {
    return new ApiError(429, msg);
  }

  static internal(msg = "Internal server error") {
    return new ApiError(500, msg);
  }
}

export default ApiError;
