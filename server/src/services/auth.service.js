import { ApiError } from '../utils/ApiError.js';
import { signAuthToken, generateRawTokenWithHash, hashToken } from '../utils/token.js';
import { sendEmail, buildVerificationEmail, buildPasswordResetEmail } from '../utils/email.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

const MINUTES = (n) => n * 60 * 1000;

export async function registerUser({ name, email, password, college, department, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const { token: rawToken, hash } = generateRawTokenWithHash();

  const user = await User.create({
    name,
    email,
    password,
    college,
    department,
    phone,
    verificationTokenHash: hash,
    verificationTokenExpires: new Date(Date.now() + MINUTES(env.EMAIL_VERIFICATION_EXPIRES_MIN)),
  });

  const { subject, html, text } = buildVerificationEmail(rawToken, user.name);
  await sendEmail({ to: user.email, subject, html, text });

  return user.toSafeJSON();
}

export async function verifyEmail(rawToken) {
  const hash = hashToken(rawToken);

  const user = await User.findOne({
    verificationTokenHash: hash,
    verificationTokenExpires: { $gt: new Date() },
  }).select('+verificationTokenHash +verificationTokenExpires');

  if (!user) {
    throw ApiError.badRequest('This verification link is invalid or has expired');
  }

  user.isVerified = true;
  user.verificationTokenHash = null;
  user.verificationTokenExpires = null;
  await user.save();

  const token = signAuthToken(user);
  return { user: user.toSafeJSON(), token };
}

export async function resendVerificationEmail(email) {
  const user = await User.findOne({ email });

  // Always respond the same way whether or not the account exists, so this
  // endpoint can't be used to enumerate registered emails.
  if (!user || user.isVerified) return;

  const { token: rawToken, hash } = generateRawTokenWithHash();
  user.verificationTokenHash = hash;
  user.verificationTokenExpires = new Date(Date.now() + MINUTES(env.EMAIL_VERIFICATION_EXPIRES_MIN));
  await user.save();

  const { subject, html, text } = buildVerificationEmail(rawToken, user.name);
  await sendEmail({ to: user.email, subject, html, text });
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password');
  }

  if (user.isBanned) {
    throw ApiError.forbidden('This account has been suspended');
  }

  if (!user.isVerified) {
    throw ApiError.forbidden('Please verify your college email before logging in');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAuthToken(user);
  return { user: user.toSafeJSON(), token };
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });

  // Same "always succeed" shape as resendVerificationEmail — don't leak
  // which emails have accounts.
  if (!user) return;

  const { token: rawToken, hash } = generateRawTokenWithHash();
  user.passwordResetTokenHash = hash;
  user.passwordResetExpires = new Date(Date.now() + MINUTES(env.PASSWORD_RESET_EXPIRES_MIN));
  await user.save();

  const { subject, html, text } = buildPasswordResetEmail(rawToken, user.name);
  await sendEmail({ to: user.email, subject, html, text });
}

export async function resetPassword(rawToken, newPassword) {
  const hash = hashToken(rawToken);

  const user = await User.findOne({
    passwordResetTokenHash: hash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires +password');

  if (!user) {
    throw ApiError.badRequest('This reset link is invalid or has expired');
  }

  user.password = newPassword; // pre-save hook re-hashes
  user.passwordResetTokenHash = null;
  user.passwordResetExpires = null;
  await user.save();

  const token = signAuthToken(user);
  return { user: user.toSafeJSON(), token };
}

export async function getUserById(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user.toSafeJSON();
}
