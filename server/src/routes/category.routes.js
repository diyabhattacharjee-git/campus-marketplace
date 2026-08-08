import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Category from '../models/Category.js';

const router = Router();

router.use(protect);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    new ApiResponse(200, { categories }, 'Categories').send(res);
  }),
);

export default router;
