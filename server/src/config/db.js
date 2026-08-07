import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

mongoose.set('strictQuery', true);
// By default Mongoose queues ("buffers") queries issued before a connection
// is ready and only errors out after a 10s timeout. That makes every
// request take 10 full seconds to fail during an outage. We'd rather fail
// immediately and let the client retry/show an error right away.
mongoose.set('bufferCommands', false);

let isConnected = false;

/**
 * Connects to MongoDB. Does NOT crash the process on failure — it logs
 * clearly and lets server.js decide what to do (in production you'd exit;
 * in local dev you often want the API to still boot so you can see the
 * error and fix your .env without also losing all your terminal output).
 */
export async function connectDB() {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.info(`MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

export function isDbConnected() {
  return isConnected;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
