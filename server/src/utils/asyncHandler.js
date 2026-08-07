/**
 * Express doesn't automatically catch rejected promises from async route
 * handlers — an unhandled rejection in `async (req, res) => {...}` just
 * hangs the request. Wrapping every controller in this forwards any thrown
 * error (including ApiError) straight to next(), so the global error
 * handler in middleware/errorHandler.js is the ONLY place that formats
 * error responses.
 *
 * Usage:
 *   router.get('/:id', asyncHandler(getListingById));
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
