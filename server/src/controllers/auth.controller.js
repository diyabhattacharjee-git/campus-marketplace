import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as authService from '../services/auth.service.js';

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, college, department, phone } = req.body;
  const user = await authService.registerUser({ name, email, password, college, department, phone });

  new ApiResponse(
    201,
    { user },
    'Account created. Check your email for a verification link before logging in.',
  ).send(res);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { user, token } = await authService.verifyEmail(req.params.token);
  new ApiResponse(200, { user, token }, 'Email verified — you are now logged in').send(res);
});

export const resendVerification = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.body.email);
  // Always the same message — does not reveal whether the email exists or is already verified.
  new ApiResponse(200, null, 'If an account exists for that email, a verification link has been sent.').send(res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  new ApiResponse(200, { user, token }, 'Logged in successfully').send(res);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  new ApiResponse(200, null, 'If an account exists for that email, a reset link has been sent.').send(res);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { user, token } = await authService.resetPassword(req.params.token, req.body.password);
  new ApiResponse(200, { user, token }, 'Password reset — you are now logged in').send(res);
});

export const getMe = asyncHandler(async (req, res) => {
  // req.user is already loaded by the `protect` middleware — no extra DB hit needed.
  new ApiResponse(200, { user: req.user.toSafeJSON() }, 'Current user').send(res);
});

export const logout = asyncHandler(async (req, res) => {
  // Stateless JWT: nothing to invalidate server-side yet. This endpoint
  // exists so the client has one consistent place to call, and so that a
  // real token blocklist (Redis) can be dropped in later without changing
  // the API contract.
  new ApiResponse(200, null, 'Logged out').send(res);
});
