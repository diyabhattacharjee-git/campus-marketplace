import { body, param } from 'express-validator';
import { CONDITIONS } from '../models/Listing.js';

export const submitBidValidator = [
  body('buyerRequestId').isMongoId().withMessage('Invalid request id'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('condition').isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}`),
  body('deliveryEstimateDays')
    .isInt({ min: 0 })
    .withMessage('Delivery estimate must be a non-negative whole number of days'),
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

export const bidIdParamValidator = [param('id').isMongoId().withMessage('Invalid bid id')];
