import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as userService from '../services/user.service.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  // req.user is already loaded by `protect` — same pattern as GET /auth/me.
  new ApiResponse(200, { user: req.user.toSafeJSON() }, 'Current profile').send(res);
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getPublicProfile(req.params.id);
  new ApiResponse(200, { user: profile }, 'Profile').send(res);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  new ApiResponse(200, { user }, 'Profile updated').send(res);
});

export const updateMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No image file was uploaded');
  }
  const user = await userService.updateAvatar(req.user._id, req.file);
  new ApiResponse(200, { user }, 'Avatar updated').send(res);
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  new ApiResponse(200, null, 'Password changed').send(res);
});
