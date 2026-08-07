import { body, param } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }),
  body('college').optional().trim().notEmpty().withMessage('College cannot be empty'),
  body('department').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Enter a valid phone number'),
  body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).withMessage('Bio must be under 300 characters'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
];

export const userIdParamValidator = [param('id').isMongoId().withMessage('Invalid user id')];
