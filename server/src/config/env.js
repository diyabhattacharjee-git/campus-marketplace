import dotenv from 'dotenv';

dotenv.config();

/**
 * Every environment variable the app needs, read and validated exactly once,
 * here. Nothing else in the codebase should call `process.env` directly —
 * that scatters "what variables does this app need?" across dozens of files
 * and lets a typo'd var name fail silently as `undefined` deep in a service.
 *
 * Fail fast: if a required variable is missing, the app should refuse to
 * boot in a way that says exactly which variable is missing, instead of
 * crashing later with a cryptic Mongo/JWT error.
 */
const REQUIRED_IN_PRODUCTION = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-marketplace',

  // Used to build absolute URLs for locally-stored uploads when Cloudinary
  // isn't configured (see services/upload.service.js). Not used for
  // anything security-sensitive.
  SERVER_URL: process.env.SERVER_URL || `http://localhost:${Number(process.env.PORT) || 5000}`,

  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Comma-separated list of allowed college email domains, e.g.
  // "iitb.ac.in,vjti.ac.in". Empty = any domain is accepted (still must be
  // verified by email link) — useful for local development/demo without a
  // real college domain on hand.
  ALLOWED_EMAIL_DOMAINS: (process.env.ALLOWED_EMAIL_DOMAINS || '')
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean),

  EMAIL_FROM: process.env.EMAIL_FROM || 'Campus Marketplace <no-reply@campus-marketplace.local>',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',

  EMAIL_VERIFICATION_EXPIRES_MIN: Number(process.env.EMAIL_VERIFICATION_EXPIRES_MIN) || 60 * 24, // 24h
  PASSWORD_RESET_EXPIRES_MIN: Number(process.env.PASSWORD_RESET_EXPIRES_MIN) || 15,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX) || 200,
};

export function assertRequiredEnv() {
  if (env.NODE_ENV !== 'production') return;

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}
