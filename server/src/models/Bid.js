import mongoose from 'mongoose';
import { CONDITIONS } from './Listing.js';

const { Schema } = mongoose;

const STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'];

const bidSchema = new Schema(
  {
    buyerRequest: { type: Schema.Types.ObjectId, ref: 'BuyerRequest', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    condition: { type: String, enum: CONDITIONS, required: [true, 'Condition is required'] },
    deliveryEstimateDays: {
      type: Number,
      required: [true, 'Delivery estimate is required'],
      min: [0, 'Delivery estimate cannot be negative'],
    },
    message: { type: String, trim: true, maxlength: 500, default: '' },

    status: { type: String, enum: STATUSES, default: 'pending', index: true },
  },
  { timestamps: true },
);

// One bid document per seller per request — re-bidding updates this
// document (see bid.service.js) instead of creating a second row, which is
// what makes "seller revises their offer to stay competitive" a clean
// update rather than a pile of stale duplicate bids.
bidSchema.index({ buyerRequest: 1, seller: 1 }, { unique: true });

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
export { STATUSES };
