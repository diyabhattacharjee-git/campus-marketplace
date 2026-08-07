import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * General limiter applied to all /api routes — generous, just there to
 * blunt scraping/abuse. Auth endpoints get a much stricter limiter (see
 * authLimiter) once Step 4 adds login/signup, since those are the routes
 * brute-force and credential-stuffing attempts actually target.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/**
 * Tighter limiter for sensitive auth actions (login, signup, forgot
 * password). Wired onto specific routes in Step 4.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again in a few minutes.' },
});
