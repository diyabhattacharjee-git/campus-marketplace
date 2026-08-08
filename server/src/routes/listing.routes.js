import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadListingImages } from '../middleware/upload.js';
import * as listingController from '../controllers/listing.controller.js';
import {
  createListingValidator,
  updateListingValidator,
  listingIdParamValidator,
  listListingsValidator,
} from '../validators/listing.validator.js';

const router = Router();

router.use(protect);

// Static path before the '/:id' param route, same reasoning as user.routes.js.
router.get('/mine', listingController.getMyListings);

router.get('/', listListingsValidator, validate, listingController.getListings);
router.get('/:id', listingIdParamValidator, validate, listingController.getListingById);

// multer runs before the validators below — multipart form fields only
// land on req.body once multer has parsed them.
router.post('/', uploadListingImages, createListingValidator, validate, listingController.createListing);
router.put('/:id', uploadListingImages, updateListingValidator, validate, listingController.updateListing);

router.delete('/:id', listingIdParamValidator, validate, listingController.deleteListing);

export default router;
