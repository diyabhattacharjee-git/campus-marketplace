import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

/** Signs a session JWT. Payload stays minimal — just enough to identify + authorize the user without a DB hit on every request. */
export function signAuthToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET); // throws JsonWebTokenError / TokenExpiredError on failure
}

/**
 * Generates a random token for one-time links (email verification, password
 * reset). Returns both:
 *  - `token`   -> raw value, put in the emailed URL, never stored
 *  - `hash`    -> sha256 of the raw value, stored in the DB
 *
 * To validate a token that comes back from a link, hash the incoming raw
 * token with `hashToken()` and compare against the stored hash — this way a
 * database leak alone can never be used to forge a working verification or
 * reset link.
 */
export function generateRawTokenWithHash() {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(token);
  return { token, hash };
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
