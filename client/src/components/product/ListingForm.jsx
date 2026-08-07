import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUploader from '@/components/product/ImageUploader';

import { categoryService } from '@/services/categoryService';
import { queryKeys } from '@/lib/queryClient';
import { listingSchema, CONDITIONS } from '@/schemas/listingSchemas';

export default function ListingForm({ defaultValues, existingImages, onSubmit, isSubmitting, submitLabel }) {
  const [images, setImages] = useState([]);
  const [imagesError, setImagesError] = useState(null);

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
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      price: '',
      isNegotiable: false,
      condition: '',
      location: '',
      ...defaultValues,
    },
  });

  const isEdit = Boolean(existingImages);

  const submit = (values) => {
    if (!isEdit && images.length === 0) {
      setImagesError('At least one image is required');
      return;
    }
    setImagesError(null);
    onSubmit({ ...values, images });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(submit)} noValidate>
      <div>
        <Label>Photos</Label>
        {isEdit && existingImages?.length > 0 && images.length === 0 && (
          <div className="mb-3 mt-1.5">
            <p className="mb-2 text-xs text-muted-foreground">
              Current photos — add new ones below only if you want to replace all of them.
            </p>
            <div className="flex gap-2">
              {existingImages.map((img) => (
                <img key={img.url} src={img.url} alt="" className="size-16 rounded-lg border border-border object-cover" />
              ))}
            </div>
          </div>
        )}
        <div className="mt-1.5">
          <ImageUploader files={images} onChange={setImages} error={imagesError} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Casio FX-991ES Plus Calculator" aria-invalid={Boolean(errors.title)} {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          placeholder="Condition, reason for selling, any accessories included..."
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={Boolean(errors.category)}>
                  <SelectValue placeholder="Select a category" />
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
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Condition</Label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={Boolean(errors.condition)}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" type="number" min="0" step="1" aria-invalid={Boolean(errors.price)} {...register('price')} />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">Location (optional)</Label>
          <Input id="location" placeholder="Hostel Block C" {...register('location')} />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 rounded border-input" {...register('isNegotiable')} />
        Price is negotiable
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
