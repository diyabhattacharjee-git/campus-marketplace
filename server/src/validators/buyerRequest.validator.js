import { body, param, query } from 'express-validator';
import { CONDITION_PREFERENCES } from '../models/BuyerRequest.js';

export const createBuyerRequestValidator = [
  body('itemName').trim().notEmpty().withMessage('Item name is required').isLength({ max: 120 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('category').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid category'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('conditionPreference').optional().isIn(CONDITION_PREFERENCES),
  body('neededBy').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date').toDate(),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

export const updateBuyerRequestValidator = [
  param('id').isMongoId().withMessage('Invalid request id'),
  body('itemName').optional().trim().notEmpty().isLength({ max: 120 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('category').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid category'),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('conditionPreference').optional().isIn(CONDITION_PREFERENCES),
  body('neededBy').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid date').toDate(),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

export const buyerRequestIdParamValidator = [param('id').isMongoId().withMessage('Invalid request id')];

export const listBuyerRequestsValidator = [
  query('category').optional().isMongoId().withMessage('Invalid category'),
  query('search').optional().trim().isLength({ max: 100 }),
  query('sort').optional().isIn(['newest', 'oldest', 'budget_asc', 'budget_desc']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];
