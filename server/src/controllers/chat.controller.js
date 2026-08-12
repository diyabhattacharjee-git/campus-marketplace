import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as chatService from '../services/chat.service.js';

export const startChat = asyncHandler(async (req, res) => {
  const chat = await chatService.getOrCreateChat(req.user._id, req.body.userId, req.body.listingId);
  new ApiResponse(200, { chat }, 'Chat ready').send(res);
});

export const getMyChats = asyncHandler(async (req, res) => {
  const chats = await chatService.getMyChats(req.user._id);
  new ApiResponse(200, { chats }, 'Your chats').send(res);
});

export const getChatById = asyncHandler(async (req, res) => {
  const chat = await chatService.getChatById(req.params.id, req.user._id);
  new ApiResponse(200, { chat }, 'Chat').send(res);
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.getMessages(req.params.id, req.user._id, req.query);
  new ApiResponse(200, { messages }, 'Messages').send(res);
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { message, recipientId } = await chatService.sendMessage(req.params.id, req.user, {
    text: req.body.text,
    file: req.file,
  });

  // Deliver to whoever is actively looking at this chat (joined the
  // chat:<id> room) AND ping the recipient's personal room so their chat
  // list can update a preview/unread badge even if they're elsewhere in
  // the app right now.
  const io = req.app.get('io');
  io.to(`chat:${req.params.id}`).emit('chat:message', { message });
  io.to(`user:${recipientId}`).emit('chat:preview', { chatId: req.params.id, message });

  new ApiResponse(201, { message }, 'Message sent').send(res);
});

export const markSeen = asyncHandler(async (req, res) => {
  const { senderId } = await chatService.markSeen(req.params.id, req.user._id);

  req.app.get('io').to(`user:${senderId}`).emit('chat:seen', { chatId: req.params.id, seenBy: req.user._id });

  new ApiResponse(200, null, 'Marked as seen').send(res);
});
