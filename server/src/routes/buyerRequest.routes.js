import { Router } from 'express';
import { param } from 'express-validator';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as buyerRequestController from '../controllers/buyerRequest.controller.js';
import * as bidController from '../controllers/bid.controller.js';
import {
  createBuyerRequestValidator,
  updateBuyerRequestValidator,
  buyerRequestIdParamValidator,
  listBuyerRequestsValidator,
} from '../validators/buyerRequest.validator.js';

const router = Router();

router.use(protect);

// Static path before '/:id', same convention as every other resource router.
router.get('/mine', buyerRequestController.getMyBuyerRequests);

router.get('/', listBuyerRequestsValidator, validate, buyerRequestController.getBuyerRequests);
router.post('/', createBuyerRequestValidator, validate, buyerRequestController.createBuyerRequest);

router.get('/:id', buyerRequestIdParamValidator, validate, buyerRequestController.getBuyerRequestById);
router.patch('/:id', updateBuyerRequestValidator, validate, buyerRequestController.updateBuyerRequest);
router.delete('/:id', buyerRequestIdParamValidator, validate, buyerRequestController.cancelBuyerRequest);

// Owner-only: full bid comparison list (price, seller identity) — never
// exposed to competing sellers, see buyerRequest.service.js.
router.get('/:id/bids', buyerRequestIdParamValidator, validate, buyerRequestController.getBidsForRequest);

// Owner-only: accept one bid. Nested under the request because "accept" is
// fundamentally an action on the buyer's own request, not a standalone bid
// operation the way submit/withdraw (in bid.routes.js) are seller actions.
router.patch(
  '/:requestId/bids/:bidId/accept',
  [param('requestId').isMongoId(), param('bidId').isMongoId()],
  validate,
  bidController.acceptBid,
);

export default router;
