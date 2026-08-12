import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { uploadChatImage } from '../middleware/upload.js';
import * as chatController from '../controllers/chat.controller.js';
import {
  startChatValidator,
  chatIdParamValidator,
  sendMessageValidator,
  listMessagesValidator,
} from '../validators/chat.validator.js';

const router = Router();

router.use(protect);

router.get('/', chatController.getMyChats);
router.post('/', startChatValidator, validate, chatController.startChat);

router.get('/:id', chatIdParamValidator, validate, chatController.getChatById);
router.get('/:id/messages', listMessagesValidator, validate, chatController.getMessages);

// multer before validators — same ordering reason as listing image uploads.
router.post('/:id/messages', uploadChatImage, sendMessageValidator, validate, chatController.sendMessage);
router.patch('/:id/seen', chatIdParamValidator, validate, chatController.markSeen);

export default router;
