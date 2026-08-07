import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Must be registered LAST, after all routes (see app.js). Express recognizes
 * it as an error handler purely because it declares 4 arguments.
 *
 * Handles three cases:
 *  1. Our own ApiError (isOperational: true)      -> use its status/message
 *  2. Known Mongoose errors (bad ObjectId, dup key, validation) -> map to 4xx
 *  3. Anything else (a genuine bug)                -> log full details,
 *     return a generic 500 to the client so internals never leak.
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Multer: file upload errors (size limit, unexpected field, etc.)
  if (err.name === 'MulterError') {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 2MB)' : `Upload error: ${err.message}`;
  }

  // Mongoose: DB not connected (bufferCommands: false makes this fail
  // immediately instead of hanging for 10s — see config/db.js)
  if (err.name === 'MongooseError' && /before initial connection|buffering timed out/.test(message)) {
    statusCode = 503;
    message = 'Database is temporarily unavailable — please try again shortly';
  }

  // Mongoose: invalid ObjectId passed to findById/findOne
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Mongoose: unique index violation
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already exists` : 'Duplicate value';
  }

  // Mongoose: schema validation failure
  if (err.name === 'ValidationError') {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => e.message);
    message = 'Validation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token expired';
  }

  if (!err.isOperational && statusCode === 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    // Stack traces only ever leave the server in development.
    ...(env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
  });
}
