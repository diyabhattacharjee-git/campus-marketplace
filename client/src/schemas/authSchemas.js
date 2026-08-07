import { z } from 'zod';

// Mirrors server/src/validators/auth.validator.js — kept in sync by hand
// for now; if these ever drift, the server is the source of truth since it
// re-validates everything regardless of what the client checked.
const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain at least one number');

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name must be under 80 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: passwordRule,
  college: z.string().trim().min(1, 'College is required'),
  department: z.string().trim().max(100).optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
