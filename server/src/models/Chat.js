import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    // Always exactly 2, always stored in a consistent sorted order (see
    // chat.service.js getOrCreateChat) so a compound unique index can
    // prevent duplicate threads between the same two people.
    participants: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      validate: { validator: (arr) => arr.length === 2, message: 'A chat has exactly 2 participants' },
    },

    // Optional context: which listing prompted this conversation. Shown as
    // a reference card at the top of the chat window, but the thread
    // itself is per-person, not per-listing — see docs/ARCHITECTURE.md for
    // the reasoning (mirrors how most marketplace apps do DMs).
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', default: null },

    // Denormalized so the chat list can render previews with a single
    // query instead of a join/aggregation per row.
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: Schema.Types.ObjectId, ref: 'User', default: null },
      hasImage: { type: Boolean, default: false },
    },
    lastMessageAt: { type: Date, default: Date.now, index: true },

    // Keyed by participant userId (as a string) -> unread count for that
    // person. Denormalized specifically so the chat list can show unread
    // badges with one query instead of a per-chat message count.
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true },
);

chatSchema.index({ participants: 1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
