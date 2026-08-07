import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

/**
 * Drop this after any array of express-validator checks:
 *   router.post('/signup', signupValidator, validate, signup)
 * Keeps the "did validation fail?" check out of every controller.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
  next(ApiError.badRequest('Validation failed', details));
}
