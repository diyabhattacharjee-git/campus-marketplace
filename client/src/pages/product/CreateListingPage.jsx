import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import ListingForm from '@/components/product/ListingForm';
import { listingService } from '@/services/listingService';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) => listingService.createListing(payload),
    onSuccess: (res) => {
      toast.success('Listing created');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.mine });
      navigate(ROUTES.PRODUCT_DETAILS.replace(':id', res.data.listing._id));
    },
    onError: (err) => toast.error(err.message || 'Could not create your listing'),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">List an item</h1>
        <p className="text-sm text-muted-foreground">Add photos and details so buyers know what they’re getting.</p>
      </div>

      <ListingForm
        onSubmit={(values) => createMutation.mutate(values)}
        isSubmitting={createMutation.isPending}
        submitLabel="Publish listing"
      />
    </div>
  );
}
