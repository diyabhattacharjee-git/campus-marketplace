import http from 'http';

import { env, assertRequiredEnv } from './config/env.js';
import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { initializeSocket } from './sockets/index.js';
import { logger } from './utils/logger.js';

async function start() {
  assertRequiredEnv();

  const app = createApp();
  const httpServer = http.createServer(app);
  const io = initializeSocket(httpServer);

  // Make the io instance reachable from controllers/services via
  // req.app.get('io'), so e.g. a bid-accepted controller can do
  // req.app.get('io').to(sellerId).emit('bid:accepted', ...) without
  // importing a singleton or passing io through every function signature.
  app.set('io', io);

  try {
    await connectDB();
  } catch (err) {
    logger.error(`Failed to connect to MongoDB: ${err.message}`);
    logger.warn('Starting server without a database connection — API routes that touch the DB will fail until MongoDB is reachable.');
  }

  httpServer.listen(env.PORT, () => {
    logger.info(`Campus Marketplace API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown on Ctrl+C / process managers sending SIGTERM
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
