import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadAvatar } from '../middleware/upload.js';
import * as userController from '../controllers/user.controller.js';
import {
  updateProfileValidator,
  changePasswordValidator,
  userIdParamValidator,
} from '../validators/user.validator.js';

const router = Router();

// Every route here requires a logged-in, verified user — this is a
// closed-campus marketplace, not a public directory (see brief: "verify
// college email before accessing the marketplace").
router.use(protect);

// Static paths ('/me', '/me/avatar') must be declared before the '/:id'
// param route below, or Express would try to match "me" as a Mongo id.
router.get('/me', userController.getMyProfile);
router.patch('/me', updateProfileValidator, validate, userController.updateMyProfile);
router.post('/me/avatar', uploadAvatar, userController.updateMyAvatar);
router.patch('/me/password', changePasswordValidator, validate, userController.changeMyPassword);

router.get('/:id', userIdParamValidator, validate, userController.getPublicProfile);

export default router;
