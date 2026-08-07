import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConditionBadge from '@/components/product/ConditionBadge';

import { listingService } from '@/services/listingService';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function MyListingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.products.mine,
    queryFn: () => listingService.getMyListings(),
  });

  const markSoldMutation = useMutation({
    mutationFn: (id) => listingService.updateListing(id, { status: 'sold' }),
    onSuccess: () => {
      toast.success('Marked as sold');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not update this listing'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => listingService.deleteListing(id),
    onSuccess: () => {
      toast.success('Listing removed');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.mine });
    },
    onError: (err) => toast.error(err.message || 'Could not remove this listing'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">My listings</h1>
          <p className="text-sm text-muted-foreground">Manage what you’re selling.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.CREATE_PRODUCT}>
            <Plus className="size-4" />
            List an item
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading your listings…
        </div>
      )}

      {isError && (
        <p className="py-12 text-center text-sm text-muted-foreground">Couldn’t load your listings right now.</p>
      )}

      {!isLoading && !isError && data.data.listings.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Package className="size-8" />
          <p>You haven’t listed anything yet.</p>
          <Button asChild>
            <Link to={ROUTES.CREATE_PRODUCT}>List your first item</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {data?.data.listings.map((listing) => {
          const detailUrl = ROUTES.PRODUCT_DETAILS.replace(':id', listing._id);
          const editUrl = ROUTES.EDIT_PRODUCT.replace(':id', listing._id);

          return (
            <Card key={listing._id}>
              <CardContent className="flex items-center gap-4 pt-6">
                <Link to={detailUrl} className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {listing.images?.[0] && (
                    <img src={listing.images[0].url} alt="" className="size-full object-cover" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link to={detailUrl} className="truncate font-medium hover:underline">
                    {listing.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-display font-semibold text-foreground">{formatPrice(listing.price)}</span>
                    <ConditionBadge condition={listing.condition} />
                    {listing.status === 'sold' && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">Sold</span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {listing.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markSoldMutation.mutate(listing._id)}
                      disabled={markSoldMutation.isPending}
                    >
                      Mark sold
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild aria-label="Edit">
                    <Link to={editUrl}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => deleteMutation.mutate(listing._id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
