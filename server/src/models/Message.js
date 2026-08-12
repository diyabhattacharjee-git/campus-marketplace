import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    text: { type: String, trim: true, maxlength: 2000, default: '' },
    image: {
      url: { type: String, default: null },
      publicId: { type: String, default: null },
    },

    // Every chat here is strictly 1:1, so "seen" only ever means "has the
    // other participant seen this" — a single timestamp is enough. No
    // readBy array needed until/unless group chat is ever added.
    seenAt: { type: Date, default: null },
  },
  { timestamps: true },
);

messageSchema.pre('validate', function requireTextOrImage(next) {
  if (!this.text && !this.image?.url) {
    next(new Error('A message needs text or an image'));
    return;
  }
  next();
});

messageSchema.index({ chat: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
