import { ApiError } from '../utils/ApiError.js';
import { uploadImage } from './upload.service.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

const PARTICIPANT_PROJECTION = 'name avatar';
const LISTING_PROJECTION = 'title price images';

function assertParticipant(chat, userId) {
  const isParticipant = chat.participants.some((p) => p.toString() === userId.toString());
  if (!isParticipant) {
    throw ApiError.forbidden('You are not part of this conversation');
  }
}

function withOtherParticipant(chat, userId) {
  const obj = chat.toObject ? chat.toObject() : chat;
  obj.otherParticipant = obj.participants.find((p) => p._id.toString() !== userId.toString());
  obj.unreadCount = obj.unread?.get ? obj.unread.get(userId.toString()) || 0 : obj.unread?.[userId.toString()] || 0;
  return obj;
}

export async function getOrCreateChat(userId, otherUserId, listingId) {
  if (userId.toString() === otherUserId.toString()) {
    throw ApiError.badRequest('You cannot start a chat with yourself');
  }

  let chat = await Chat.findOne({ participants: { $all: [userId, otherUserId] } })
    .populate('participants', PARTICIPANT_PROJECTION)
    .populate('listing', LISTING_PROJECTION);

  if (!chat) {
    chat = await Chat.create({
      participants: [userId, otherUserId],
      listing: listingId || null,
    });
    chat = await Chat.findById(chat._id)
      .populate('participants', PARTICIPANT_PROJECTION)
      .populate('listing', LISTING_PROJECTION);
  } else if (listingId && !chat.listing) {
    chat.listing = listingId;
    await chat.save();
    await chat.populate('listing', LISTING_PROJECTION);
  }

  return withOtherParticipant(chat, userId);
}

export async function getMyChats(userId) {
  const chats = await Chat.find({ participants: userId })
    .sort({ lastMessageAt: -1 })
    .populate('participants', PARTICIPANT_PROJECTION)
    .populate('listing', LISTING_PROJECTION);

  return chats.map((chat) => withOtherParticipant(chat, userId));
}

export async function getChatById(chatId, userId) {
  const chat = await Chat.findById(chatId)
    .populate('participants', PARTICIPANT_PROJECTION)
    .populate('listing', LISTING_PROJECTION);

  if (!chat) throw ApiError.notFound('Conversation not found');
  assertParticipant(chat, userId);

  return withOtherParticipant(chat, userId);
}

export async function getMessages(chatId, userId, options) {
  const before = options?.before;
  const limit = options?.limit || 30;

  const chat = await Chat.findById(chatId);
  if (!chat) throw ApiError.notFound('Conversation not found');
  assertParticipant(chat, userId);

  const query = { chat: chatId };
  if (before) query.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(query).sort({ createdAt: -1 }).limit(limit);
  return messages.reverse();
}

export async function sendMessage(chatId, sender, payload) {
  const text = payload.text;
  const file = payload.file;

  const chat = await Chat.findById(chatId);
  if (!chat) throw ApiError.notFound('Conversation not found');
  assertParticipant(chat, sender._id);

  if (!text && !file) {
    throw ApiError.badRequest('A message needs text or an image');
  }

  let image;
  if (file) {
    const uploaded = await uploadImage(file.buffer, file.mimetype, 'chat');
    image = uploaded;
  }

  const message = await Message.create({
    chat: chatId,
    sender: sender._id,
    text: text || '',
    image: image || undefined,
  });

  const recipientId = chat.participants.find((p) => p.toString() !== sender._id.toString());
  const recipientKey = recipientId.toString();

  chat.lastMessage = { text: text || (image ? 'Sent a photo' : ''), sender: sender._id, hasImage: Boolean(image) };
  chat.lastMessageAt = new Date();
  chat.unread.set(recipientKey, (chat.unread.get(recipientKey) || 0) + 1);
  await chat.save();

  return { message, recipientId };
}

export async function markSeen(chatId, userId) {
  const chat = await Chat.findById(chatId);
  if (!chat) throw ApiError.notFound('Conversation not found');
  assertParticipant(chat, userId);

  await Message.updateMany(
    { chat: chatId, sender: { $ne: userId }, seenAt: null },
    { seenAt: new Date() },
  );

  chat.unread.set(userId.toString(), 0);
  await chat.save();

  const senderId = chat.participants.find((p) => p.toString() !== userId.toString());
  return { senderId };
}
