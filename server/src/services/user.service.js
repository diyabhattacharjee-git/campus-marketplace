import { ApiError } from '../utils/ApiError.js';
import { uploadImage, deleteImage } from './upload.service.js';
import User from '../models/User.js';

const UPDATABLE_FIELDS = ['name', 'college', 'department', 'phone', 'bio'];

/**
 * Public profile intentionally omits email and phone. Other students see a
 * seller/buyer's name, college, bio, and rating — direct contact happens
 * through in-app chat (Step 9), not by exposing personal contact info on a
 * public page. The account owner still sees everything via GET /users/me.
 */
export async function getPublicProfile(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  return {
    id: user._id,
    name: user.name,
    avatar: user.avatar,
    college: user.college,
    department: user.department,
    bio: user.bio,
    ratingAverage: user.ratingAverage,
    ratingCount: user.ratingCount,
    memberSince: user.createdAt,
  };
}

export async function updateProfile(userId, updates) {
  const changes = {};
  for (const field of UPDATABLE_FIELDS) {
    if (updates[field] !== undefined) changes[field] = updates[field];
  }

  const user = await User.findByIdAndUpdate(userId, changes, {
    new: true,
    runValidators: true,
  });
  if (!user) throw ApiError.notFound('User not found');

  return user.toSafeJSON();
}

export async function updateAvatar(userId, file) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const previousPublicId = user.avatar?.publicId || null;

  const { url, publicId } = await uploadImage(file.buffer, file.mimetype, 'avatars');
  user.avatar = { url, publicId };
  await user.save();

  // Clean up the old image only after the new one is safely saved —
  // never delete-then-upload, so a failed upload can't leave a user with
  // no avatar at all.
  if (previousPublicId) {
    await deleteImage(previousPublicId);
  }

  return user.toSafeJSON();
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) throw ApiError.badRequest('Current password is incorrect');

  user.password = newPassword; // pre-save hook re-hashes
  await user.save();
}
