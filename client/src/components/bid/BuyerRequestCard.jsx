import { Link } from 'react-router-dom';
import { Calendar, Gavel, MapPin } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { RequestStatusBadge } from '@/components/bid/StatusBadges';
import { ROUTES } from '@/constants/routes';

function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    price,
  );
}

export default function BuyerRequestCard({ request, showStatus = false }) {
  const detailUrl = ROUTES.BUYER_REQUEST_DETAILS.replace(':id', request._id);
  const neededBy = request.neededBy
    ? new Date(request.neededBy).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

  return (
    <Link to={detailUrl}>
      <Card className="h-full transition-shadow hover:shadow-card-hover">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-medium">{request.itemName}</h3>
            {showStatus && <RequestStatusBadge status={request.status} />}
          </div>

          {request.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{request.description}</p>
          )}

          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-primary">Budget {formatPrice(request.budget)}</p>
            {request.bidCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Gavel className="size-3.5" />
                {request.bidCount} bid{request.bidCount === 1 ? '' : 's'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5">
                <AvatarImage src={request.buyer?.avatar?.url} alt={request.buyer?.name} />
                <AvatarFallback className="text-[10px]">{request.buyer?.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="truncate">{request.buyer?.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {request.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {request.location}
                </span>
              )}
              {neededBy && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  By {neededBy}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
