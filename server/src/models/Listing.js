import mongoose from 'mongoose';

const { Schema } = mongoose;

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'];
const STATUSES = ['active', 'sold', 'removed'];

const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // Cloudinary public_id (or "local:..." — see upload.service.js)
  },
  { _id: false },
);

/**
 * priceHistory is appended to on every price change (see
 * listing.service.js), never mutated — this is what lets Step 14 draw a
 * "price vs date" chart later with zero migration needed, because the data
 * has been collected since the listing's first day.
 */
const priceHistoryEntrySchema = new Schema(
  {
    price: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const listingSchema = new Schema(
  {
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 2000 },

    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },

    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    isNegotiable: { type: Boolean, default: false },

    condition: { type: String, enum: CONDITIONS, required: [true, 'Condition is required'] },

    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length >= 1 && arr.length <= 6,
        message: 'A listing needs between 1 and 6 images',
      },
    },

    location: { type: String, trim: true, default: '' }, // e.g. hostel block — informal, not geocoded

    status: { type: String, enum: STATUSES, default: 'active', index: true },

    priceHistory: { type: [priceHistoryEntrySchema], default: [] },

    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Text index powers the search filter (Step 7); compound indexes power the
// common "browse active listings in a category, sorted" query pattern.
listingSchema.index({ title: 'text', description: 'text' });
listingSchema.index({ status: 1, category: 1, createdAt: -1 });
listingSchema.index({ status: 1, price: 1 });

listingSchema.methods.recordPriceChange = function recordPriceChange(newPrice) {
  this.priceHistory.push({ price: newPrice, changedAt: new Date() });
  this.price = newPrice;
};

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
export { CONDITIONS, STATUSES };
