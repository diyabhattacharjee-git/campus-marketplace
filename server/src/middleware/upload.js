import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB — generous for an avatar, small enough to not be abused

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(ApiError.badRequest('Only JPEG, PNG, or WebP images are allowed'));
    return;
  }
  cb(null, true);
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
}).single('avatar');

const MAX_LISTING_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — product photos are larger than a small avatar crop
const MAX_LISTING_IMAGES = 6;

export const uploadListingImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_LISTING_IMAGE_SIZE_BYTES, files: MAX_LISTING_IMAGES },
}).array('images', MAX_LISTING_IMAGES);
