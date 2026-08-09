import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { buyerRequestService } from '@/services/buyerRequestService';
import { categoryService } from '@/services/categoryService';
import { buyerRequestSchema, CONDITION_PREFERENCES } from '@/schemas/buyerRequestSchemas';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

export default function CreateBuyerRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesRes } = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesRes?.data.categories || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(buyerRequestSchema),
    defaultValues: {
      itemName: '',
      description: '',
      category: '',
      budget: '',
      conditionPreference: 'any',
      neededBy: '',
      location: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => buyerRequestService.createBuyerRequest(payload),
    onSuccess: (res) => {
      toast.success('Request posted — sellers can now bid on it');
      queryClient.invalidateQueries({ queryKey: queryKeys.buyerRequests.mine });
      navigate(ROUTES.BUYER_REQUEST_DETAILS.replace(':id', res.data.request._id));
    },
    onError: (err) => toast.error(err.message || 'Could not post your request'),
  });

  const onSubmit = (values) => {
    createMutation.mutate({
      ...values,
      category: values.category || undefined,
      neededBy: values.neededBy || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Post a request</h1>
        <p className="text-sm text-muted-foreground">
          Tell sellers what you need — they’ll compete with bids on price, condition, and delivery time.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="itemName">What do you need?</Label>
          <Input id="itemName" placeholder="Casio FX-991ES Calculator" aria-invalid={Boolean(errors.itemName)} {...register('itemName')} />
          {errors.itemName && <p className="text-sm text-destructive">{errors.itemName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Details (optional)</Label>
          <Textarea id="description" rows={3} placeholder="Any specifics — brand, model, must-haves..." {...register('description')} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget (₹)</Label>
            <Input id="budget" type="number" min="0" aria-invalid={Boolean(errors.budget)} {...register('budget')} />
            {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Condition preference</Label>
            <Controller
              name="conditionPreference"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_PREFERENCES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Category (optional)</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neededBy">Needed by (optional)</Label>
            <Input id="neededBy" type="date" {...register('neededBy')} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" placeholder="Hostel Block C" {...register('location')} />
        </div>

        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && <Loader2 className="animate-spin" />}
          Post request
        </Button>
      </form>
    </div>
  );
}
