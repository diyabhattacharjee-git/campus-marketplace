import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as buyerRequestService from '../services/buyerRequest.service.js';

export const createBuyerRequest = asyncHandler(async (req, res) => {
  const request = await buyerRequestService.createBuyerRequest(req.user, req.body);

  // Broadcast to every connected student — see sockets/index.js for why
  // this uses a shared feed room rather than per-category subscriptions.
  // Step 10 (Notifications) adds the persisted, per-user notification
  // record on top of this live signal; this is just "update in real time
  // if you happen to be looking at the page right now."
  req.app.get('io').to('buyer-requests:feed').emit('buyer-request:new', { request });

  new ApiResponse(201, { request }, 'Request posted').send(res);
});

export const getBuyerRequests = asyncHandler(async (req, res) => {
  const { requests, pagination } = await buyerRequestService.getBuyerRequests(req.query);
  new ApiResponse(200, { requests, pagination }, 'Requests').send(res);
});

export const getMyBuyerRequests = asyncHandler(async (req, res) => {
  const requests = await buyerRequestService.getMyBuyerRequests(req.user._id);
  new ApiResponse(200, { requests }, 'Your requests').send(res);
});

export const getBuyerRequestById = asyncHandler(async (req, res) => {
  const request = await buyerRequestService.getBuyerRequestById(req.params.id);
  new ApiResponse(200, { request }, 'Request').send(res);
});

export const updateBuyerRequest = asyncHandler(async (req, res) => {
  const request = await buyerRequestService.updateBuyerRequest(req.params.id, req.user, req.body);
  new ApiResponse(200, { request }, 'Request updated').send(res);
});

export const cancelBuyerRequest = asyncHandler(async (req, res) => {
  await buyerRequestService.cancelBuyerRequest(req.params.id, req.user);
  new ApiResponse(200, null, 'Request cancelled').send(res);
});

export const getBidsForRequest = asyncHandler(async (req, res) => {
  const bids = await buyerRequestService.getBidsForRequest(req.params.id, req.user);
  new ApiResponse(200, { bids }, 'Bids').send(res);
});
