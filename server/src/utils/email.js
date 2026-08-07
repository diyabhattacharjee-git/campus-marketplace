import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }

  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise falls back to logging the
 * subject + link to the console. This means the whole auth flow — signup,
 * verify, forgot password, reset — is fully testable locally with zero
 * email provider setup: just copy the link out of the terminal.
 *
 * Wire up real SMTP (or swap this for SendGrid/SES) by setting SMTP_HOST /
 * SMTP_USER / SMTP_PASS in .env — no other file needs to change.
 */
export async function sendEmail({ to, subject, html, text }) {
  const activeTransporter = getTransporter();

  if (!activeTransporter) {
    logger.warn(
      `SMTP not configured — logging email instead of sending.\n` +
        `  To:      ${to}\n` +
        `  Subject: ${subject}\n` +
        `  Body:\n${text || html}\n`,
    );
    return { delivered: false, reason: 'smtp_not_configured' };
  }

  await activeTransporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  return { delivered: true };
}

export function buildVerificationEmail(rawToken, name) {
  const link = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  return {
    subject: 'Verify your Campus Marketplace account',
    text: `Hi ${name}, verify your account: ${link} (expires in ${env.EMAIL_VERIFICATION_EXPIRES_MIN / 60} hours)`,
    html: `
      <p>Hi ${name},</p>
      <p>Welcome to Campus Marketplace. Verify your college email to start buying and selling:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in ${env.EMAIL_VERIFICATION_EXPIRES_MIN / 60} hours.</p>
    `,
  };
}

export function buildPasswordResetEmail(rawToken, name) {
  const link = `${env.CLIENT_URL}/reset-password/${rawToken}`;
  return {
    subject: 'Reset your Campus Marketplace password',
    text: `Hi ${name}, reset your password: ${link} (expires in ${env.PASSWORD_RESET_EXPIRES_MIN} minutes). If you didn't request this, ignore this email.`,
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password:</p>
      <p><a href="${link}">${link}</a></p>
      <p>This link expires in ${env.PASSWORD_RESET_EXPIRES_MIN} minutes. If you didn't request this, you can safely ignore this email.</p>
    `,
  };
}
