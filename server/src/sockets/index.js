import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAuthToken } from '../utils/token.js';
import { registerChatHandlers } from './chat.js';

/**
 * Room naming convention used across every real-time feature:
 *   `user:<userId>`         — targeted delivery to one person (bid events
 *                              from Step 8; chat previews/seen receipts here)
 *   `chat:<chatId>`         — everyone actively viewing one conversation
 *   `buyer-requests:feed`   — every connected, authenticated user; used to
 *                              broadcast new buyer requests (Step 8) and,
 *                              here, online/offline presence changes
 */

// In-memory presence: userId -> number of open sockets for that user (a
// person can have the app open in two tabs; they're "online" until the
// last one disconnects). Single-process only — scaling to multiple server
// instances would need this moved to Redis (the brief already flags Redis
// as an optional piece of the architecture for exactly this kind of thing).
const onlineUsers = new Map();

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const { token } = socket.handshake.auth || {};
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAuthToken(token);
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket.data;
    socket.join(`user:${userId}`);
    socket.join('buyer-requests:feed');
    logger.info(`Socket connected: ${socket.id} (user ${userId})`);

    const priorCount = onlineUsers.get(userId) || 0;
    onlineUsers.set(userId, priorCount + 1);
    if (priorCount === 0) {
      io.to('buyer-requests:feed').emit('presence:online', { userId });
    }

    registerChatHandlers(io, socket);
    // Step 10 adds:  registerNotificationHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
      const remaining = (onlineUsers.get(userId) || 1) - 1;
      if (remaining <= 0) {
        onlineUsers.delete(userId);
        io.to('buyer-requests:feed').emit('presence:offline', { userId });
      } else {
        onlineUsers.set(userId, remaining);
      }
    });
  });

  return io;
}

export function isUserOnline(userId) {
  return onlineUsers.has(userId.toString());
}
