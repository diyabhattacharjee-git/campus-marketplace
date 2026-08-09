import { useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Calendar, Check, Loader2, MapPin, Star, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequestStatusBadge, BidStatusBadge } from '@/components/bid/StatusBadges';
import ConditionBadge from '@/components/product/ConditionBadge';

import { buyerRequestService } from '@/services/buyerRequestService';
import { bidService } from '@/services/bidService';
import { bidSchema } from '@/schemas/bidSchemas';
import { CONDITIONS } from '@/schemas/listingSchemas';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/lib/queryClient';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function BuyerRequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.buyerRequests.detail(id),
    queryFn: () => buyerRequestService.getBuyerRequestById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading request…
      </div>
    );
  }

  if (isError) {
    return <p className="py-16 text-center text-muted-foreground">This request couldn’t be found.</p>;
  }

  const request = data.data.request;
  const currentUserId = user?._id || user?.id;
  const isOwner = request.buyer._id === currentUserId;

  const neededByLabel = request.neededBy
    ? new Date(request.neededBy).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-2xl font-semibold">{request.itemName}</h1>
              <RequestStatusBadge status={request.status} />
            </div>

            {request.description && <p className="text-sm text-muted-foreground">{request.description}</p>}

            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="font-display text-xl font-semibold text-primary">{formatPrice(request.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Condition preference</p>
                <p className="font-medium capitalize">{request.conditionPreference}</p>
              </div>
              {neededByLabel && (
                <div>
                  <p className="text-xs text-muted-foreground">Needed by</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Calendar className="size-3.5" /> {neededByLabel}
                  </p>
                </div>
              )}
              {request.location && (
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="flex items-center gap-1 font-medium">
                    <MapPin className="size-3.5" /> {request.location}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Avatar className="size-8">
                <AvatarImage src={request.buyer.avatar?.url} alt={request.buyer.name} />
                <AvatarFallback>{request.buyer.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{request.buyer.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="size-3 fill-warning text-warning" />
                  {request.buyer.ratingCount > 0 ? request.buyer.ratingAverage.toFixed(1) : 'No ratings yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isOwner ? (
          <OwnerBidComparison requestId={id} requestStatus={request.status} acceptedBid={request.acceptedBid} />
        ) : (
          <SellerBidPanel requestId={id} requestStatus={request.status} />
        )}
      </div>
    </div>
  );
}

function OwnerBidComparison({ requestId, requestStatus, acceptedBid }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.buyerRequests.bids(requestId),
    queryFn: () => buyerRequestService.getBidsForRequest(requestId),
  });

  const acceptMutation = useMutation({
    mutationFn: (bidId) => buyerRequestService.acceptBid(requestId, bidId),
    onSuccess: () => {
      toast.success('Bid accepted — other bids were automatically declined');
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.bids(requestId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not accept this bid'),
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading bids…
      </div>
    );
  }

  const bids = data?.data.bids || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Bids ({bids.length}){requestStatus === 'closed' && acceptedBid && ' — accepted'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bids.length === 0 && <p className="text-sm text-muted-foreground">No bids yet — check back soon.</p>}

        {bids.map((bid) => {
          const isAccepted = bid.status === 'accepted';
          const isPending = bid.status === 'pending';

          return (
            <div
              key={bid._id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 ${
                isAccepted ? 'border-success bg-success/5' : 'border-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={bid.seller.avatar?.url} alt={bid.seller.name} />
                  <AvatarFallback>{bid.seller.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{bid.seller.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="size-3 fill-warning text-warning" />
                    {bid.seller.ratingCount > 0 ? bid.seller.ratingAverage.toFixed(1) : 'No ratings yet'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-display text-lg font-semibold">{formatPrice(bid.price)}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ConditionBadge condition={bid.condition} />
                    <span>{bid.deliveryEstimateDays}d delivery</span>
                  </div>
                </div>
                {isPending && requestStatus === 'open' ? (
                  <Button size="sm" onClick={() => acceptMutation.mutate(bid._id)} disabled={acceptMutation.isPending}>
                    {acceptMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                    Accept
                  </Button>
                ) : (
                  <BidStatusBadge status={bid.status} />
                )}
              </div>

              {bid.message && <p className="w-full text-sm text-muted-foreground">“{bid.message}”</p>}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SellerBidPanel({ requestId, requestStatus }) {
  const queryClient = useQueryClient();

  // No dedicated "my bid on this request" endpoint — reuse the seller's
  // full bid list (already fetched elsewhere via /bids/mine) and find the
  // one matching this request client-side, rather than adding a redundant
  // single-purpose API route.
  const { data: myBidsRes, isLoading } = useQuery({
    queryKey: queryKeys.bids.mine,
    queryFn: () => bidService.getMyBids(),
  });

  const myBid = myBidsRes?.data.bids.find((b) => b.buyerRequest?._id === requestId && b.status !== 'withdrawn');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bidSchema),
    defaultValues: myBid
      ? {
          price: myBid.price,
          condition: myBid.condition,
          deliveryEstimateDays: myBid.deliveryEstimateDays,
          message: myBid.message,
        }
      : { price: '', condition: '', deliveryEstimateDays: '', message: '' },
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => bidService.submitBid({ buyerRequestId: requestId, ...payload }),
    onSuccess: () => {
      toast.success(myBid ? 'Bid updated' : 'Bid submitted');
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not submit your bid'),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => bidService.withdrawBid(myBid._id),
    onSuccess: () => {
      toast.success('Bid withdrawn');
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not withdraw your bid'),
  });

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading…
      </div>
    );
  }

  if (requestStatus !== 'open') {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          This request is no longer accepting bids.
        </CardContent>
      </Card>
    );
  }

  if (myBid && myBid.status !== 'pending') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your bid</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">{formatPrice(myBid.price)}</p>
          <BidStatusBadge status={myBid.status} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{myBid ? 'Your bid' : 'Place a bid'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => submitMutation.mutate(values))}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Your price (₹)</Label>
              <Input id="price" type="number" min="0" aria-invalid={Boolean(errors.price)} {...register('price')} />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deliveryEstimateDays">Delivery (days)</Label>
              <Input
                id="deliveryEstimateDays"
                type="number"
                min="0"
                aria-invalid={Boolean(errors.deliveryEstimateDays)}
                {...register('deliveryEstimateDays')}
              />
              {errors.deliveryEstimateDays && (
                <p className="text-sm text-destructive">{errors.deliveryEstimateDays.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Condition of item you’re offering</Label>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={Boolean(errors.condition)}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" rows={2} placeholder="Anything the buyer should know..." {...register('message')} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || submitMutation.isPending}>
              {submitMutation.isPending && <Loader2 className="animate-spin" />}
              {myBid ? 'Update bid' : 'Submit bid'}
            </Button>
            {myBid && (
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                Withdraw
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
