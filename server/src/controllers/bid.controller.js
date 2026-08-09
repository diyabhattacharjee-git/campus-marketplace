import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as bidService from '../services/bid.service.js';

export const submitBid = asyncHandler(async (req, res) => {
  const { bid, buyerId } = await bidService.submitBid(req.user, req.body);

  req.app.get('io').to(`user:${buyerId}`).emit('bid:new', { bid });

  new ApiResponse(201, { bid }, 'Bid submitted').send(res);
});

export const getMyBids = asyncHandler(async (req, res) => {
  const bids = await bidService.getMyBids(req.user._id);
  new ApiResponse(200, { bids }, 'Your bids').send(res);
});

export const withdrawBid = asyncHandler(async (req, res) => {
  const { bid, buyerId } = await bidService.withdrawBid(req.params.id, req.user);

  if (buyerId) {
    req.app.get('io').to(`user:${buyerId}`).emit('bid:withdrawn', { bidId: bid._id });
  }

  new ApiResponse(200, { bid }, 'Bid withdrawn').send(res);
});

export const acceptBid = asyncHandler(async (req, res) => {
  const { acceptedBid, rejectedSellerIds } = await bidService.acceptBid(
    req.params.requestId,
    req.params.bidId,
    req.user,
  );

  const io = req.app.get('io');
  io.to(`user:${acceptedBid.seller._id}`).emit('bid:accepted', { bid: acceptedBid });
  rejectedSellerIds.forEach((sellerId) => {
    io.to(`user:${sellerId}`).emit('bid:rejected', { requestId: req.params.requestId });
  });

  new ApiResponse(200, { bid: acceptedBid }, 'Bid accepted').send(res);
});
