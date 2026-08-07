import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';
import {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  resendVerificationValidator,
} from '../validators/auth.validator.js';

const router = Router();

// authLimiter applies to every route in this file — these are exactly the
// endpoints credential-stuffing/brute-force/enumeration attacks target.
router.use(authLimiter);

router.post('/signup', signupValidator, validate, authController.signup);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', protect, authController.logout);

router.get('/verify-email/:token', verifyEmailValidator, validate, authController.verifyEmail);
router.post('/resend-verification', resendVerificationValidator, validate, authController.resendVerification);

router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, authController.resetPassword);

router.get('/me', protect, authController.getMe);

export default router;
