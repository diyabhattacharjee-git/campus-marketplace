import { z } from 'zod';

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name cannot be empty').max(80, 'Name must be under 80 characters'),
  college: z.string().trim().min(1, 'College cannot be empty'),
  department: z.string().trim().max(100).optional().or(z.literal('')),
  phone: z
    .string()
    .trim()
    .regex(/^$|^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  bio: z.string().trim().max(300, 'Bio must be under 300 characters').optional().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/\d/, 'New password must contain at least one number'),
    confirmNewPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });
