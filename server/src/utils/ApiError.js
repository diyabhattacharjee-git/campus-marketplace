/**
 * A typed application error carrying an HTTP status code.
 *
 * Controllers/services throw this (usually via a static helper below) and
 * the global error handler (middleware/errorHandler.js) turns it into a
 * consistent JSON response. This is what lets `asyncHandler` just catch and
 * forward every error to one place instead of every route handling its own.
 *
 * Example:
 *   const listing = await Listing.findById(id);
 *   if (!listing) throw ApiError.notFound('Listing not found');
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distinguishes "expected" errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict', details = null) {
    return new ApiError(409, message, details);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }
}
