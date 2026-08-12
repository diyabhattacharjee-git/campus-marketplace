import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, Loader2, MapPin, MessageCircle, Pencil, Star, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ConditionBadge from '@/components/product/ConditionBadge';

import { listingService } from '@/services/listingService';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => listingService.getListingById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => listingService.deleteListing(id),
    onSuccess: () => {
      toast.success('Listing removed');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.mine });
      navigate(ROUTES.PRODUCTS);
    },
    onError: (err) => toast.error(err.message || 'Could not remove this listing'),
  });

  const startChatMutation = useMutation({
    mutationFn: (sellerId) => chatService.startChat({ userId: sellerId, listingId: id }),
    onSuccess: (res) => {
      navigate(ROUTES.CHAT_DETAIL.replace(':id', res.data.chat._id));
    },
    onError: (err) => toast.error(err.message || 'Could not start a chat'),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading listing…
      </div>
    );
  }

  if (isError) {
    return <p className="py-16 text-center text-muted-foreground">This listing couldn&rsquo;t be found.</p>;
  }

  const listing = data.data.listing;
  const isOwner = user?._id === listing.seller._id || user?.id === listing.seller._id;
  const editUrl = ROUTES.EDIT_PRODUCT.replace(':id', listing._id);
  const sellerProfileUrl = ROUTES.USER_PROFILE.replace(':id', listing.seller._id);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
          {listing.images?.[activeImage] && (
            <img
              src={listing.images[activeImage].url}
              alt={listing.title}
              className="size-full object-cover"
            />
          )}
        </div>
        {listing.images?.length > 1 && (
          <div className="flex gap-2">
            {listing.images.map((img, i) => (
              <button
                key={img.url}
                onClick={() => setActiveImage(i)}
                className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activeImage ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-semibold">{listing.title}</h1>
            <ConditionBadge condition={listing.condition} />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold text-primary">
            {formatPrice(listing.price)}
            {listing.isNegotiable && <span className="ml-2 text-sm font-normal text-muted-foreground">Negotiable</span>}
          </p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" /> {listing.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="size-4" /> {listing.viewCount} views
            </span>
          </div>
        </div>

        <div>
          <h2 className="font-medium">Description</h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{listing.description}</p>
        </div>

        {/* Seller card */}
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Link to={sellerProfileUrl}>
              <Avatar>
                <AvatarImage src={listing.seller.avatar?.url} alt={listing.seller.name} />
                <AvatarFallback>{listing.seller.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={sellerProfileUrl} className="truncate font-medium hover:underline">
                {listing.seller.name}
              </Link>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-warning text-warning" />
                {listing.seller.ratingCount > 0 ? listing.seller.ratingAverage.toFixed(1) : 'No ratings yet'}
              </p>
            </div>
            {!isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startChatMutation.mutate(listing.seller._id)}
                disabled={startChatMutation.isPending}
              >
                {startChatMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <MessageCircle className="size-4" />
                )}
                Message
              </Button>
            )}
          </CardContent>
        </Card>

        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link to={editUrl}>
                <Pencil className="size-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
