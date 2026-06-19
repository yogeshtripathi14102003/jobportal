/**
 * Consistent JSON response shape for every route.
 *
 * Success:  { success: true,  statusCode, message, data, meta? }
 * Fail:     { success: false, statusCode, message, errors? }
 */
class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;           // pagination, counts, etc.
    this.success = statusCode < 400;
  }
}

/**
 * Send a success response.
 * @param {Response} res
 * @param {number}   statusCode
 * @param {string}   message
 * @param {*}        data
 * @param {*}        meta        optional metadata (pagination, totals …)
 */
export const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = new ApiResponse(statusCode, message, data, meta);
  return res.status(statusCode).json(response);
};

/**
 * Send an error response (used inside the global error handler).
 */
export const sendError = (res, statusCode = 500, message = "Something went wrong", errors = []) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length ? errors : undefined,
  });
};

export default ApiResponse;
