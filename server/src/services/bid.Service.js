import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import Bid from '../models/Bid.js';
import BuyerRequest from '../models/BuyerRequest.js';

const SELLER_PROJECTION = 'name avatar college ratingAverage ratingCount';
const REQUEST_POPULATE = { path: 'buyerRequest', select: 'itemName budget status buyer' };

/**
 * Create or revise a bid. A seller gets exactly one live bid per request —
 * bidding again updates that same document (and resets it to 'pending' if
 * they're re-entering after withdrawing) rather than stacking duplicates,
 * which is what lets a seller stay competitive as the deadline approaches
 * without cluttering the buyer's comparison list with their own history.
 */
export async function submitBid(seller, data) {
  const request = await BuyerRequest.findById(data.buyerRequestId);
  if (!request) throw ApiError.notFound('Request not found');

  if (request.status !== 'open') {
    throw ApiError.badRequest('This request is no longer accepting bids');
  }
  if (request.buyer.toString() === seller._id.toString()) {
    throw ApiError.badRequest('You cannot bid on your own request');
  }

  const update = {
    price: data.price,
    condition: data.condition,
    deliveryEstimateDays: data.deliveryEstimateDays,
    message: data.message || '',
    status: 'pending', // re-entering after a withdrawal (or revising) always resets to pending
  };

  // rawResult exposes whether this matched an existing document or
  // inserted a new one — that's how we know whether to bump bidCount below
  // without a separate read-then-write race.
  const result = await Bid.findOneAndUpdate(
    { buyerRequest: data.buyerRequestId, seller: seller._id },
    { $set: update, $setOnInsert: { buyerRequest: data.buyerRequestId, seller: seller._id } },
    { new: true, upsert: true, runValidators: true, includeResultMetadata: true },
  );

  const isNewBid = !result.lastErrorObject?.updatedExisting;
  if (isNewBid) {
    await BuyerRequest.updateOne({ _id: data.buyerRequestId }, { $inc: { bidCount: 1 } });
  }

  const bid = await Bid.findById(result.value._id).populate('seller', SELLER_PROJECTION);
  return { bid, buyerId: request.buyer };
}

export async function getMyBids(sellerId) {
  return Bid.find({ seller: sellerId }).sort({ createdAt: -1 }).populate(REQUEST_POPULATE);
}

export async function withdrawBid(bidId, seller) {
  const bid = await Bid.findById(bidId);
  if (!bid) throw ApiError.notFound('Bid not found');
  if (bid.seller.toString() !== seller._id.toString()) {
    throw ApiError.forbidden('You do not have permission to do this');
  }
  if (bid.status !== 'pending') {
    throw ApiError.badRequest('Only a pending bid can be withdrawn');
  }

  bid.status = 'withdrawn';
  await bid.save();
  await BuyerRequest.updateOne({ _id: bid.buyerRequest }, { $inc: { bidCount: -1 } });

  const request = await BuyerRequest.findById(bid.buyerRequest).select('buyer');
  return { bid, buyerId: request?.buyer };
}

/**
 * The core reverse-auction moment: buyer accepts one bid, every other
 * pending bid on the same request is automatically rejected, and the
 * request closes. Wrapped in a transaction so a crash mid-operation can
 * never leave two "accepted" bids or an open request with an accepted bid
 * dangling off it.
 *
 * Transactions require MongoDB to be running as a replica set — true by
 * default on MongoDB Atlas (the deployment target per the brief), but NOT
 * true for a bare `mongod` run locally with default settings. If the
 * transaction API isn't available, this falls back to sequential writes
 * (logged clearly) so local development against a standalone MongoDB still
 * works — just without the same atomicity guarantee.
 */
export async function acceptBid(requestId, bidId, buyer) {
  const request = await BuyerRequest.findById(requestId);
  if (!request) throw ApiError.notFound('Request not found');
  if (request.buyer.toString() !== buyer._id.toString()) {
    throw ApiError.forbidden('You do not have permission to do this');
  }
  if (request.status !== 'open') {
    throw ApiError.badRequest('This request is already closed');
  }

  const bid = await Bid.findById(bidId);
  if (!bid || bid.buyerRequest.toString() !== requestId) {
    throw ApiError.notFound('Bid not found for this request');
  }
  if (bid.status !== 'pending') {
    throw ApiError.badRequest('Only a pending bid can be accepted');
  }

  const doAccept = async (session) => {
    bid.status = 'accepted';
    await bid.save({ session });

    await Bid.updateMany(
      { buyerRequest: requestId, _id: { $ne: bid._id }, status: 'pending' },
      { status: 'rejected' },
      { session },
    );

    request.status = 'closed';
    request.acceptedBid = bid._id;
    await request.save({ session });
  };

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(() => doAccept(session));
  } catch (err) {
    const transactionsUnsupported = /Transaction numbers|IllegalOperation|replica set/i.test(err.message);
    if (!transactionsUnsupported) throw err;

    logger.warn(
      `MongoDB transactions unavailable (${err.message}) — falling back to sequential writes for bid ${bidId}. ` +
        'This is expected on a standalone local mongod; MongoDB Atlas (replica set) supports transactions natively.',
    );
    await doAccept(undefined);
  } finally {
    await session.endSession();
  }

  const rejectedBids = await Bid.find({ buyerRequest: requestId, status: 'rejected' }).select('seller');

  return {
    acceptedBid: await Bid.findById(bid._id).populate('seller', SELLER_PROJECTION),
    rejectedSellerIds: rejectedBids.map((b) => b.seller),
  };
}
