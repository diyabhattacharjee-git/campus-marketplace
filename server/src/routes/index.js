import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Step 6 adds:  router.use('/products', productRoutes);
// Step 8 adds:  router.use('/buyer-requests', buyerRequestRoutes);
//               router.use('/bids', bidRoutes);
// ...and so on, one line per resource, keeping this file as the map of the
// entire public API surface.

export default router;
