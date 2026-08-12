import { body, param, query } from 'express-validator';

export const startChatValidator = [
  body('userId').isMongoId().withMessage('Invalid user id'),
  body('listingId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid listing id'),
];

export const chatIdParamValidator = [param('id').isMongoId().withMessage('Invalid chat id')];

export const sendMessageValidator = [
  param('id').isMongoId().withMessage('Invalid chat id'),
  body('text').optional({ checkFalsy: true }).trim().isLength({ max: 2000 }),
];

export const listMessagesValidator = [
  param('id').isMongoId().withMessage('Invalid chat id'),
  query('before').optional().isISO8601().withMessage('Invalid date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
