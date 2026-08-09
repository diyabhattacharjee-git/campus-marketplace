import { Badge } from '@/components/ui/badge';

const REQUEST_STATUS_CONFIG = {
  open: { label: 'Open', variant: 'success' },
  closed: { label: 'Closed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'secondary' },
};

const BID_STATUS_CONFIG = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Not selected', variant: 'secondary' },
  withdrawn: { label: 'Withdrawn', variant: 'secondary' },
};

export function RequestStatusBadge({ status, className }) {
  const config = REQUEST_STATUS_CONFIG[status] || { label: status, variant: 'secondary' };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

export function BidStatusBadge({ status, className }) {
  const config = BID_STATUS_CONFIG[status] || { label: status, variant: 'secondary' };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
