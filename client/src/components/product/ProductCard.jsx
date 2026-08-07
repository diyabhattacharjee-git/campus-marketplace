import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import ConditionBadge from '@/components/product/ConditionBadge';
import { ROUTES } from '@/constants/routes';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function ProductCard({ listing }) {
  const detailUrl = ROUTES.PRODUCT_DETAILS.replace(':id', listing._id);
  const coverImage = listing.images?.[0]?.url;

  return (
    <Link to={detailUrl}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-card-hover">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {coverImage ? (
            <img
              src={coverImage}
              alt={listing.title}
              className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
          {listing.status === 'sold' && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
              <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Sold
              </span>
            </div>
          )}
        </div>

        <CardContent className="space-y-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-sm font-medium text-foreground">{listing.title}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-foreground">
              {formatPrice(listing.price)}
              {listing.isNegotiable && <span className="ml-1 text-xs font-normal text-muted-foreground">(negotiable)</span>}
            </p>
            <ConditionBadge condition={listing.condition} />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{listing.seller?.name}</span>
            {listing.location && (
              <span className="flex shrink-0 items-center gap-1">
                <MapPin className="size-3" />
                {listing.location}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
