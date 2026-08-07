import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  // Trust the first proxy hop (Render/Railway sit behind one) so
  // req.ip / rate-limiting see the real client IP, not the proxy's.
  app.set('trust proxy', 1);

  // --- Security & parsing middleware (order matters) ---
  app.use(
    helmet({
      // Images/uploads are meant to be loaded by the separate frontend
      // origin (different port in dev, different domain in prod) — the
      // default same-origin policy would silently block avatar images.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '10mb' })); // 10mb: generous enough for base64 image fallbacks, still bounded
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize()); // strips $/. keys from req.body/query/params — blocks Mongo operator injection
  app.use(hpp()); // guards against ?sort=price&sort=name style HTTP param pollution

  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

  // --- Rate limiting on the whole API surface ---
  app.use('/api', apiLimiter);

  // --- Routes ---
  app.use('/api', routes);

  // Static file serving for the local-dev upload fallback (see
  // services/upload.service.js). In production, Cloudinary should be
  // configured and this route simply won't be hit for new uploads.
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.get('/', (req, res) => {
    res.json({ success: true, message: 'Campus Marketplace API is running' });
  });

  // --- 404 + centralized error handling (must be last) ---
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
