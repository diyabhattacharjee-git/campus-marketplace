import { ApiError } from '../utils/ApiError.js';
import { uploadImage, deleteImage } from './upload.service.js';
import Listing from '../models/Listing.js';

const SELLER_PROJECTION = 'name avatar college ratingAverage ratingCount';

function assertOwnerOrAdmin(listing, user) {
  const isOwner = listing.seller.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw ApiError.forbidden('You do not have permission to modify this listing');
  }
}

export async function createListing(seller, data, files) {
  if (!files || files.length === 0) {
    throw ApiError.badRequest('At least one image is required');
  }

  const uploaded = await Promise.all(files.map((file) => uploadImage(file.buffer, file.mimetype, 'listings')));

  const listing = await Listing.create({
    seller: seller._id,
    title: data.title,
    description: data.description,
    category: data.category,
    price: data.price,
    isNegotiable: Boolean(data.isNegotiable),
    condition: data.condition,
    location: data.location || '',
    images: uploaded.map(({ url, publicId }) => ({ url, publicId })),
    priceHistory: [{ price: data.price, changedAt: new Date() }],
  });

  return Listing.findById(listing._id).populate('seller', SELLER_PROJECTION).populate('category');
}

export async function getListings(filters) {
  const {
    category,
    condition,
    minPrice,
    maxPrice,
    search,
    seller,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = filters;

  const query = { status: 'active' };
  if (category) query.category = category;
  if (condition) query.condition = condition;
  if (seller) query.seller = seller;
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }
  if (search) {
    query.$text = { $search: search };
  }

  const SORT_MAP = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  const skip = (page - 1) * limit;

  const [listings, total] = await Promise.all([
    Listing.find(query)
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip(skip)
      .limit(limit)
      .populate('seller', SELLER_PROJECTION)
      .populate('category'),
    Listing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getListingById(id, { incrementView = false } = {}) {
  const listing = await Listing.findById(id)
    .populate('seller', SELLER_PROJECTION)
    .populate('category');

  if (!listing || listing.status === 'removed') {
    throw ApiError.notFound('Listing not found');
  }

  if (incrementView) {
    // Fire-and-forget style, but awaited so tests/callers see a consistent
    // count — a single $inc is a cheap enough write to not batch/debounce
    // at this scale.
    listing.viewCount += 1;
    await listing.save();
  }

  return listing;
}

export async function updateListing(id, user, updates, newFiles) {
  const listing = await Listing.findById(id);
  if (!listing || listing.status === 'removed') {
    throw ApiError.notFound('Listing not found');
  }
  assertOwnerOrAdmin(listing, user);

  const FIELDS = ['title', 'description', 'category', 'condition', 'location', 'status'];
  for (const field of FIELDS) {
    if (updates[field] !== undefined) listing[field] = updates[field];
  }
  if (updates.isNegotiable !== undefined) listing.isNegotiable = Boolean(updates.isNegotiable);

  // Price changes are tracked, not just overwritten — this is the data
  // Step 14's price-trend chart reads.
  if (updates.price !== undefined && updates.price !== listing.price) {
    listing.recordPriceChange(updates.price);
  }

  if (newFiles && newFiles.length > 0) {
    const oldImages = listing.images;
    const uploaded = await Promise.all(
      newFiles.map((file) => uploadImage(file.buffer, file.mimetype, 'listings')),
    );
    listing.images = uploaded.map(({ url, publicId }) => ({ url, publicId }));
    // Clean up old images only after the new ones are confirmed uploaded —
    // same "never delete before replace succeeds" rule as avatar updates.
    await Promise.all(oldImages.map((img) => deleteImage(img.publicId)));
  }

  await listing.save();
  return Listing.findById(listing._id).populate('seller', SELLER_PROJECTION).populate('category');
}

export async function deleteListing(id, user) {
  const listing = await Listing.findById(id);
  if (!listing || listing.status === 'removed') {
    throw ApiError.notFound('Listing not found');
  }
  assertOwnerOrAdmin(listing, user);

  // Soft delete: keeps the document (and its price history) around for any
  // orders/bids that already reference it, instead of a hard delete that
  // would leave dangling references once Steps 8/12 add those relations.
  listing.status = 'removed';
  await listing.save();
}

export async function getMyListings(sellerId) {
  return Listing.find({ seller: sellerId, status: { $ne: 'removed' } })
    .sort({ createdAt: -1 })
    .populate('category');
}
