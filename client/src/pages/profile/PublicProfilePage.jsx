import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Calendar, Loader2, UserX } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { userService } from '@/services/userService';
import { queryKeys } from '@/lib/queryClient';

export default function PublicProfilePage() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userService.getPublicProfile(id),
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

      {/* Listings / selling history / reviews sections land here once
          Step 6 (Product Listings) and Step 13 (Reviews) exist to source
          real data from — placeholder kept deliberately empty rather than
          faked. */}
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Active listings and reviews will appear here once those features are built.
        </CardContent>
      </Card>
    </div>
  );
}
