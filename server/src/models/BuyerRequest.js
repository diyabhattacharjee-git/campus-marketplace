import mongoose from 'mongoose';
import { CONDITIONS } from './Listing.js';

const { Schema } = mongoose;

const CONDITION_PREFERENCES = ['any', ...CONDITIONS];
const STATUSES = ['open', 'closed', 'cancelled', 'expired'];

const buyerRequestSchema = new Schema(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    itemName: { type: String, required: [true, 'Item name is required'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', default: null },

    budget: { type: Number, required: [true, 'Budget is required'], min: [0, 'Budget cannot be negative'] },
    conditionPreference: { type: String, enum: CONDITION_PREFERENCES, default: 'any' },
    neededBy: { type: Date, default: null },
    location: { type: String, trim: true, default: '' },

    status: { type: String, enum: STATUSES, default: 'open', index: true },
    acceptedBid: { type: Schema.Types.ObjectId, ref: 'Bid', default: null },

    // Denormalized count, kept in sync by bid.service.js on create/withdraw.
    // Lets the browse list show "4 bids so far" without an aggregation
    // query per request on every page load.
    bidCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

buyerRequestSchema.index({ status: 1, category: 1, createdAt: -1 });
buyerRequestSchema.index({ itemName: 'text', description: 'text' });

const BuyerRequest = mongoose.model('BuyerRequest', buyerRequestSchema);
export default BuyerRequest;
export { STATUSES, CONDITION_PREFERENCES };
