import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as listingService from '../services/listing.service.js';

export const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user, req.body, req.files);
  new ApiResponse(201, { listing }, 'Listing created').send(res);
});

export const getListings = asyncHandler(async (req, res) => {
  const { listings, pagination } = await listingService.getListings(req.query);
  new ApiResponse(200, { listings, pagination }, 'Listings').send(res);
});

export const getListingById = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingById(req.params.id, { incrementView: true });
  new ApiResponse(200, { listing }, 'Listing').send(res);
});

export const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.user, req.body, req.files);
  new ApiResponse(200, { listing }, 'Listing updated').send(res);
});

export const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user);
  new ApiResponse(200, null, 'Listing removed').send(res);
});

export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getMyListings(req.user._id);
  new ApiResponse(200, { listings }, 'Your listings').send(res);
});
