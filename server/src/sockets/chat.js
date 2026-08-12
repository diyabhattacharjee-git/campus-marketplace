import Chat from '../models/Chat.js';
import { logger } from '../utils/logger.js';

/**
 * Message send/seen-marking themselves go through REST (chat.controller.js
 * emits the resulting events) — this module only handles the two things
 * that are purely ephemeral and have no reason to touch the database:
 * joining/leaving the room that determines "am I actively looking at this
 * chat right now", and the typing indicator.
 */
export function registerChatHandlers(io, socket) {
  socket.on('chat:join', async (chatId) => {
    try {
      const chat = await Chat.findById(chatId).select('participants');
      const isParticipant = chat?.participants.some((p) => p.toString() === socket.data.userId);
      if (!isParticipant) {
        logger.warn(`Socket ${socket.id} tried to join chat ${chatId} without membership — ignored`);
        return;
      }
      socket.join(`chat:${chatId}`);
    } catch {
      // Invalid chatId or DB hiccup — silently ignore rather than crash the
      // socket connection over a malformed join request.
    }
  });

  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on('chat:typing', ({ chatId, isTyping }) => {
    // Relayed to everyone else in the room (never back to the sender) —
    // no persistence, no history, just "someone is typing right now".
    socket.to(`chat:${chatId}`).emit('chat:typing', { userId: socket.data.userId, isTyping });
  });
}
