/**
 * Wraps an async express route handler so you never need try/catch.
 * Any rejected promise is forwarded to next(err) → global error handler.
 *
 * Usage:
 *   router.get("/path", asyncHandler(async (req, res) => {
 *     const data = await SomeService.doThing();
 *     sendSuccess(res, 200, "Done", data);
 *   }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
