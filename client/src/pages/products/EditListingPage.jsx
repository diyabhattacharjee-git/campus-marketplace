import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import ListingForm from '@/components/product/ListingForm';
import { listingService } from '@/services/listingService';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => listingService.getListingById(id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => listingService.updateListing(id, payload),
    onSuccess: (res) => {
      toast.success('Listing updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.products.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.mine });
      navigate(ROUTES.PRODUCT_DETAILS.replace(':id', res.data.listing._id));
    },
    onError: (err) => toast.error(err.message || 'Could not update your listing'),
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Edit listing</h1>
        <p className="text-sm text-muted-foreground">Update details, price, or photos.</p>
      </div>

      <ListingForm
        defaultValues={{
          title: listing.title,
          description: listing.description,
          category: listing.category._id,
          price: listing.price,
          isNegotiable: listing.isNegotiable,
          condition: listing.condition,
          location: listing.location,
        }}
        existingImages={listing.images}
        onSubmit={(values) => updateMutation.mutate(values)}
        isSubmitting={updateMutation.isPending}
        submitLabel="Save changes"
      />
    </div>
  );
}
