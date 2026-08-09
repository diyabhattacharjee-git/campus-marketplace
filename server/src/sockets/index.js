import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { verifyAuthToken } from '../utils/token.js';

/**
 * Room naming convention used across every real-time feature:
 *   `user:<userId>`         — targeted delivery to one person (bid accepted/
 *                              rejected here in Step 8; direct notifications
 *                              in Step 10; chat delivery in Step 9)
 *   `buyer-requests:feed`   — every connected, authenticated user; used to
 *                              broadcast new buyer requests so any student
 *                              (anyone could be a seller) sees them live
 *                              without a schema for per-user category
 *                              subscriptions we don't otherwise need.
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Every socket must present the same JWT used for REST calls (see
  // client/src/lib/socket.js, which sends it as `auth.token`). This is a
  // closed-campus app — every real-time feature (bidding here, chat in
  // Step 9, notifications in Step 10) needs to know who's connected, so
  // unauthenticated sockets are rejected outright rather than allowed to
  // linger anonymously.
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
    socket.join(`user:${socket.data.userId}`);
    socket.join('buyer-requests:feed');
    logger.info(`Socket connected: ${socket.id} (user ${socket.data.userId})`);

    // Step 9 adds:  registerChatHandlers(io, socket);
    // Step 10 adds: registerNotificationHandlers(io, socket);
    // Step 8's bidding events are emitted directly from
    // controllers/bid.controller.js and buyerRequest.controller.js via
    // req.app.get('io') — no dedicated handler needed since the client
    // only listens, it never emits bidding events itself.

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
