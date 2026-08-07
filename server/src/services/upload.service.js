import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

import cloudinary from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads');

const MIME_TO_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

function isCloudinaryConfigured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

/**
 * Uploads an image buffer and returns { url, publicId }.
 *
 * Same "graceful local fallback" pattern as utils/email.js in Step 4: if
 * Cloudinary isn't configured, the file is written to server/uploads/<folder>
 * and served via the /uploads static route registered in app.js. This means
 * avatar upload is fully testable with zero third-party setup — swap in
 * real Cloudinary credentials later and nothing else has to change.
 *
 * NOTE: the local fallback is for development only. Render/Railway's
 * filesystem is ephemeral, so in production Cloudinary must be configured
 * or uploaded files will vanish on the next deploy/restart.
 */
export async function uploadImage(buffer, mimetype, folder = 'misc') {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, folder);
  }

  logger.warn('Cloudinary not configured — saving upload to local disk (development only).');
  return uploadToLocalDisk(buffer, mimetype, folder);
}

export async function deleteImage(publicId) {
  if (!publicId) return;

  if (publicId.startsWith('local:')) {
    const relativePath = publicId.replace('local:', '');
    const absolutePath = path.join(UPLOADS_ROOT, relativePath);
    await fs.unlink(absolutePath).catch(() => {}); // best-effort — don't fail the request if it's already gone
    return;
  }

  await cloudinary.uploader.destroy(publicId).catch((err) => {
    logger.error(`Failed to delete Cloudinary asset ${publicId}: ${err.message}`);
  });
}

function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `campus-marketplace/${folder}`, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

async function uploadToLocalDisk(buffer, mimetype, folder) {
  const ext = MIME_TO_EXT[mimetype] || 'jpg';
  const filename = `${crypto.randomBytes(16).toString('hex')}.${ext}`;
  const dir = path.join(UPLOADS_ROOT, folder);

  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);

  return {
    url: `${env.SERVER_URL}/uploads/${folder}/${filename}`,
    publicId: `local:${folder}/${filename}`,
  };
}
