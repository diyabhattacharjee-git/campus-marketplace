import { ApiError } from '../utils/ApiError.js';
import BuyerRequest from '../models/BuyerRequest.js';
import Bid from '../models/Bid.js';

const BUYER_PROJECTION = 'name avatar college ratingAverage ratingCount';
const SELLER_PROJECTION = 'name avatar college ratingAverage ratingCount';

function assertOwner(request, userId) {
  if (request.buyer.toString() !== userId.toString()) {
    throw ApiError.forbidden('You do not have permission to do this');
  }
}

export async function createBuyerRequest(buyer, data) {
  const request = await BuyerRequest.create({
    buyer: buyer._id,
    itemName: data.itemName,
    description: data.description || '',
    category: data.category || null,
    budget: data.budget,
    conditionPreference: data.conditionPreference || 'any',
    neededBy: data.neededBy || null,
    location: data.location || '',
  });

  return BuyerRequest.findById(request._id).populate('buyer', BUYER_PROJECTION).populate('category');
}

export async function getBuyerRequests(filters) {
  const { category, search, sort = 'newest', page = 1, limit = 12 } = filters;

  // Browsing only ever shows requests still open for bids — a seller has
  // no reason to see closed/cancelled/expired requests in the main feed.
  const query = { status: 'open' };
  if (category) query.category = category;
  if (search) query.$text = { $search: search };

  const SORT_MAP = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    budget_asc: { budget: 1 },
    budget_desc: { budget: -1 },
  };

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    BuyerRequest.find(query)
      .sort(SORT_MAP[sort] || SORT_MAP.newest)
      .skip(skip)
      .limit(limit)
      .populate('buyer', BUYER_PROJECTION)
      .populate('category'),
    BuyerRequest.countDocuments(query),
  ]);

  return { requests, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getMyBuyerRequests(buyerId) {
  return BuyerRequest.find({ buyer: buyerId })
    .sort({ createdAt: -1 })
    .populate('category')
    .populate({
      path: 'acceptedBid',
      populate: { path: 'seller', select: SELLER_PROJECTION },
    });
}

export async function getBuyerRequestById(id) {
  const request = await BuyerRequest.findById(id)
    .populate('buyer', BUYER_PROJECTION)
    .populate('category')
    .populate({
      path: 'acceptedBid',
      populate: { path: 'seller', select: SELLER_PROJECTION },
    });

  if (!request) throw ApiError.notFound('Request not found');
  return request;
}

export async function updateBuyerRequest(id, user, updates) {
  const request = await BuyerRequest.findById(id);
  if (!request) throw ApiError.notFound('Request not found');
  assertOwner(request, user._id);

  if (request.status !== 'open') {
    throw ApiError.badRequest('Only open requests can be edited');
  }

  const FIELDS = ['itemName', 'description', 'category', 'budget', 'conditionPreference', 'neededBy', 'location'];
  for (const field of FIELDS) {
    if (updates[field] !== undefined) request[field] = updates[field];
  }

  await request.save();
  return BuyerRequest.findById(request._id).populate('buyer', BUYER_PROJECTION).populate('category');
}

export async function cancelBuyerRequest(id, user) {
  const request = await BuyerRequest.findById(id);
  if (!request) throw ApiError.notFound('Request not found');
  assertOwner(request, user._id);

  if (request.status !== 'open') {
    throw ApiError.badRequest('Only open requests can be cancelled');
  }

  request.status = 'cancelled';
  await request.save();

  // Cancelling a request also closes out any pending bids on it — sellers
  // shouldn't be left with a bid that's pending against a request that no
  // longer exists in any meaningful sense.
  await Bid.updateMany({ buyerRequest: id, status: 'pending' }, { status: 'rejected' });

  return request;
}

/**
 * Owner-only: the full bid list with seller identity and price, sorted
 * cheapest-first. Deliberately NOT exposed to other sellers — reverse-
 * auction fairness means competitors shouldn't see each other's numbers,
 * only the buyer comparing them should.
 */
export async function getBidsForRequest(requestId, user) {
  const request = await BuyerRequest.findById(requestId);
  if (!request) throw ApiError.notFound('Request not found');
  assertOwner(request, user._id);

  return Bid.find({ buyerRequest: requestId, status: { $ne: 'withdrawn' } })
    .sort({ price: 1 })
    .populate('seller', SELLER_PROJECTION);
}
