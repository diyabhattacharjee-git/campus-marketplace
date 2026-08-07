import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Creates and configures the Socket.IO server. Feature-specific handlers
 * (chat in Step 9, live bidding + notifications in Step 8/10) each get
 * their own file in this folder and are registered inside the `connection`
 * handler below — e.g. `registerChatHandlers(io, socket)` — rather than
 * writing `io.on('connection', ...)` more than once anywhere in the app.
 */
export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware: every socket must present the same JWT used for REST
  // calls (see client/src/lib/socket.js, which sends it as `auth.token`).
  // Full verify-and-attach-user logic lands in Step 4 alongside the rest of
  // JWT auth; for now this just logs the handshake so we can see connections
  // happening.
  io.use((socket, next) => {
    const { token } = socket.handshake.auth || {};
    if (!token) {
      logger.warn(`Socket ${socket.id} connected without a token (allowed until Step 4 wires auth)`);
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Step 9 adds:  registerChatHandlers(io, socket);
    // Step 8 adds:  registerBiddingHandlers(io, socket);
    // Step 10 adds: registerNotificationHandlers(io, socket);

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
}
