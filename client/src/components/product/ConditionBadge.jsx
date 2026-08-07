import { Badge } from '@/components/ui/badge';

const CONDITION_CONFIG = {
  new: { label: 'New', variant: 'success' },
  'like-new': { label: 'Like new', variant: 'success' },
  good: { label: 'Good', variant: 'secondary' },
  fair: { label: 'Fair', variant: 'warning' },
  poor: { label: 'Poor', variant: 'destructive' },
};

export default function ConditionBadge({ condition, className }) {
  const config = CONDITION_CONFIG[condition] || { label: condition, variant: 'secondary' };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
