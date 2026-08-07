import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Calendar, Loader2, Package, UserX } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ProductCard from '@/components/product/ProductCard';
import { userService } from '@/services/userService';
import { listingService } from '@/services/listingService';
import { queryKeys } from '@/lib/queryClient';

export default function PublicProfilePage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getPublicProfile(id),
  });

  // Only fetched once we know the profile itself loaded — no point querying
  // listings for a user id that turned out not to exist.
  const { data: listingsRes, isLoading: listingsLoading } = useQuery({
    queryKey: queryKeys.products.list({ seller: id }),
    queryFn: () => listingService.getListings({ seller: id, limit: 8 }),
    enabled: Boolean(data),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading profile…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <UserX className="size-8" />
        <p>This profile couldn&rsquo;t be found.</p>
      </div>
    );
  }

  const user = data.data.user;
  const memberSince = new Date(user.memberSince).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardContent className="flex items-start gap-4 pt-6">
          <Avatar className="size-16">
            <AvatarImage src={user.avatar?.url} alt={user.name} />
            <AvatarFallback className="text-lg">{user.name?.[0]?.toUpperCase() ?? '?'}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl font-semibold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[user.department, user.college].filter(Boolean).join(' · ')}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-warning text-warning" />
                {user.ratingCount > 0
                  ? `${user.ratingAverage.toFixed(1)} (${user.ratingCount} review${user.ratingCount === 1 ? '' : 's'})`
                  : 'No ratings yet'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                Member since {memberSince}
              </span>
            </div>

            {user.bio && <p className="mt-3 text-sm text-foreground">{user.bio}</p>}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Listings</h2>
        {listingsLoading && (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" /> Loading listings…
          </div>
        )}
        {!listingsLoading && (listingsRes?.data.listings.length ?? 0) === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Package className="size-6" />
              No active listings right now.
            </CardContent>
          </Card>
        )}
        {(listingsRes?.data.listings.length ?? 0) > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listingsRes.data.listings.map((listing) => (
              <ProductCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews land here once Step 13 (Reviews & Ratings) exists to
          source real data from — deliberately left as an honest
          placeholder rather than faked. */}
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Reviews will appear here once that feature is built.
        </CardContent>
      </Card>
    </div>
  );
}
