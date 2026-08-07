import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    new ApiResponse(200, {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      database: DB_STATES[mongoose.connection.readyState] ?? 'unknown',
      timestamp: new Date().toISOString(),
    }, 'Server is healthy').send(res);
  }),
);

export default router;
