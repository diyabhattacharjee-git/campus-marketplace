import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAuthToken } from '../utils/token.js';
import User from '../models/User.js';

/**
 * Verifies the Bearer token, loads the user, and attaches it as req.user.
 * Any route behind this can trust req.user is a real, currently-existing
 * account — banned users are rejected here too, so no individual controller
 * has to remember to check `isBanned` itself.
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw ApiError.unauthorized('You must be logged in to do this');
  }

  let payload;
  try {
    payload = verifyAuthToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired session — please log in again');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw ApiError.unauthorized('Account no longer exists');
  }
  if (user.isBanned) {
    throw ApiError.forbidden('This account has been suspended');
  }

  req.user = user;
  next();
});

/**
 * Role gate — use after `protect`. Example:
 *   router.delete('/:id', protect, restrictTo('admin'), deleteListing)
 */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to do this'));
    }
    next();
  };
}
