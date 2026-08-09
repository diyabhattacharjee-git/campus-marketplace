import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { getSocket } from '@/lib/socket';
import { queryKeys } from '@/lib/queryClient';

/**
 * All five bidding real-time events (see server/src/sockets/index.js and
 * controllers/{bid,buyerRequest}.controller.js for the emit side) funnel
 * through here. Each handler does two things: invalidate the query that
 * would show the change, and toast a human-readable summary — no manual
 * cache-patching, so the next render just refetches truth from the API.
 */
export function useBiddingRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined; // not connected yet (e.g. session still hydrating) — AuthContext reconnects on login

    const onNewRequest = () => {
      queryClient.invalidateQueries({ queryKey: ['buyerRequests', 'list'] });
    };

    const onNewBid = ({ bid }) => {
      toast.success(`New bid: ₹${bid.price} on your request`);
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.mine });
      queryClient.invalidateQueries({ queryKey: ['buyerRequests', 'bids'] });
    };

    const onBidWithdrawn = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.mine });
      queryClient.invalidateQueries({ queryKey: ['buyerRequests', 'bids'] });
    };

    const onBidAccepted = ({ bid }) => {
      toast.success(`Your bid was accepted on "${bid.buyerRequest?.itemName || 'a request'}"! 🎉`);
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.mine });
    };

    const onBidRejected = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.mine });
    };

    socket.on('buyer-request:new', onNewRequest);
    socket.on('bid:new', onNewBid);
    socket.on('bid:withdrawn', onBidWithdrawn);
    socket.on('bid:accepted', onBidAccepted);
    socket.on('bid:rejected', onBidRejected);

    return () => {
      socket.off('buyer-request:new', onNewRequest);
      socket.off('bid:new', onNewBid);
      socket.off('bid:withdrawn', onBidWithdrawn);
      socket.off('bid:accepted', onBidAccepted);
      socket.off('bid:rejected', onBidRejected);
    };
  }, [queryClient]);
}
