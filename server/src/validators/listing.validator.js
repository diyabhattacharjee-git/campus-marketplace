import { body, param, query } from 'express-validator';
import { CONDITIONS } from '../models/Listing.js';

export const createListingValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 2000 }),
  body('category').isMongoId().withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isNegotiable').optional().isBoolean().toBoolean(),
  body('condition').isIn(CONDITIONS).withMessage(`Condition must be one of: ${CONDITIONS.join(', ')}`),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
];

export const updateListingValidator = [
  param('id').isMongoId().withMessage('Invalid listing id'),
  body('title').optional().trim().notEmpty().isLength({ max: 120 }),
  body('description').optional().trim().notEmpty().isLength({ max: 2000 }),
  body('category').optional().isMongoId().withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('isNegotiable').optional().isBoolean().toBoolean(),
  body('condition').optional().isIn(CONDITIONS),
  body('location').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('status').optional().isIn(['active', 'sold']).withMessage('Status must be active or sold'),
];

export const listingIdParamValidator = [param('id').isMongoId().withMessage('Invalid listing id')];

export const listListingsValidator = [
  query('category').optional().isMongoId().withMessage('Invalid category'),
  query('condition').optional().isIn(CONDITIONS),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('search').optional().trim().isLength({ max: 100 }),
  query('seller').optional().isMongoId().withMessage('Invalid seller id'),
  query('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc']),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];
