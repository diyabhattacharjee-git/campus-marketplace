import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import listingRoutes from './listing.routes.js';
import categoryRoutes from './category.routes.js';
import buyerRequestRoutes from './buyerRequest.routes.js';
import bidRoutes from './bid.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', listingRoutes);
router.use('/categories', categoryRoutes);
router.use('/buyer-requests', buyerRequestRoutes);
router.use('/bids', bidRoutes);

// Step 9 adds:  router.use('/chats', chatRoutes);
// ...and so on, one line per resource, keeping this file as the map of the
// entire public API surface.

export default router;
