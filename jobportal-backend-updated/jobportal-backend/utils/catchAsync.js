/**
 * Wraps an async controller function so any thrown/rejected error
 * is automatically forwarded to Express's error-handling middleware.
 *
 * Usage:
 * router.get("/", catchAsync(controllerFn))
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default catchAsync;