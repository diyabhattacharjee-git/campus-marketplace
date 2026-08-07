import { body, param } from 'express-validator';
import { env } from '../config/env.js';

/** Shared check: email must look like a college email if ALLOWED_EMAIL_DOMAINS is configured. */
function collegeEmailCheck(value) {
  if (env.ALLOWED_EMAIL_DOMAINS.length === 0) return true; // no restriction configured
  const domain = value.split('@')[1]?.toLowerCase();
  if (!env.ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    throw new Error(`Email must be from an allowed college domain (${env.ALLOWED_EMAIL_DOMAINS.join(', ')})`);
  }
  return true;
}

export const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail().custom(collegeEmailCheck),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('college').trim().notEmpty().withMessage('College is required'),
  body('department').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('phone').optional({ checkFalsy: true }).trim(),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
];

export const resetPasswordValidator = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

export const verifyEmailValidator = [param('token').notEmpty().withMessage('Verification token is required')];

export const resendVerificationValidator = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
];
