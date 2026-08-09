import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Gavel, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BidStatusBadge } from '@/components/bid/StatusBadges';
import ConditionBadge from '@/components/product/ConditionBadge';

import { bidService } from '@/services/bidService';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function MyBidsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.bids.mine,
    queryFn: () => bidService.getMyBids(),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => bidService.withdrawBid(id),
    onSuccess: () => {
      toast.success('Bid withdrawn');
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not withdraw this bid'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">My bids</h1>
        <p className="text-sm text-muted-foreground">Requests you’ve bid on, and how they turned out.</p>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading your bids…
        </div>
      )}

      {isError && <p className="py-12 text-center text-sm text-muted-foreground">Couldn’t load your bids.</p>}

      {!isLoading && !isError && data.data.bids.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Gavel className="size-8" />
          <p>You haven’t placed any bids yet.</p>
          <Button asChild>
            <Link to={ROUTES.BUYER_REQUESTS}>Browse open requests</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {data?.data.bids.map((bid) => {
          const requestUrl = ROUTES.BUYER_REQUEST_DETAILS.replace(':id', bid.buyerRequest?._id);

          return (
            <Card key={bid._id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div>
                  <Link to={requestUrl} className="font-medium hover:underline">
                    {bid.buyerRequest?.itemName || 'Request no longer available'}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-display font-semibold text-foreground">{formatPrice(bid.price)}</span>
                    <ConditionBadge condition={bid.condition} />
                    <span>{bid.deliveryEstimateDays}d delivery</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BidStatusBadge status={bid.status} />
                  {bid.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => withdrawMutation.mutate(bid._id)}
                      disabled={withdrawMutation.isPending}
                      aria-label="Withdraw bid"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
