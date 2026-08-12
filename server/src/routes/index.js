import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import listingRoutes from './listing.routes.js';
import categoryRoutes from './category.routes.js';
import buyerRequestRoutes from './buyerRequest.routes.js';
import bidRoutes from './bid.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', listingRoutes);
router.use('/categories', categoryRoutes);
router.use('/buyer-requests', buyerRequestRoutes);
router.use('/bids', bidRoutes);
router.use('/chats', chatRoutes);

// Step 10 adds:  router.use('/notifications', notificationRoutes);
// ...and so on, one line per resource, keeping this file as the map of the
// entire public API surface.

export default router;
