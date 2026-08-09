import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Gavel, Loader2, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BuyerRequestCard from '@/components/bid/BuyerRequestCard';

import { buyerRequestService } from '@/services/buyerRequestService';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

export default function MyBuyerRequestsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.buyerRequests.mine,
    queryFn: () => buyerRequestService.getMyBuyerRequests(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => buyerRequestService.cancelBuyerRequest(id),
    onSuccess: () => {
      toast.success('Request cancelled');
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not cancel this request'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">My requests</h1>
          <p className="text-sm text-muted-foreground">What you’ve posted for sellers to bid on.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.CREATE_BUYER_REQUEST}>
            <Plus className="size-4" />
            Post a request
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading your requests…
        </div>
      )}

      {isError && <p className="py-12 text-center text-sm text-muted-foreground">Couldn’t load your requests.</p>}

      {!isLoading && !isError && data.data.requests.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Gavel className="size-8" />
          <p>You haven’t posted any requests yet.</p>
          <Button asChild>
            <Link to={ROUTES.CREATE_BUYER_REQUEST}>Post your first request</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.requests.map((request) => (
          <div key={request._id} className="relative">
            <BuyerRequestCard request={request} showStatus />
            {request.status === 'open' && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 size-7 bg-card text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  cancelMutation.mutate(request._id);
                }}
                disabled={cancelMutation.isPending}
                aria-label="Cancel request"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {data?.data.requests.some((r) => r.status === 'closed' && r.acceptedBid) && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Closed requests keep their accepted bid on record — open one to see who you picked.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
