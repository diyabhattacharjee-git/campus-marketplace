import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as bidController from '../controllers/bid.controller.js';
import { submitBidValidator, bidIdParamValidator } from '../validators/bid.validator.js';

const router = Router();

router.use(protect);

router.get('/mine', bidController.getMyBids);
router.post('/', submitBidValidator, validate, bidController.submitBid);
router.patch('/:id/withdraw', bidIdParamValidator, validate, bidController.withdrawBid);

export default router;
