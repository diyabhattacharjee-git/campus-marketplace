import { z } from 'zod';

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const listingSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120, 'Title must be under 120 characters'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(2000, 'Description must be under 2000 characters'),
  category: z.string().trim().min(1, 'Choose a category'),
  price: z.coerce.number({ invalid_type_error: 'Enter a price' }).min(0, 'Price cannot be negative'),
  isNegotiable: z.boolean().optional(),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Choose a condition' }),
  }),
  location: z.string().trim().max(100).optional().or(z.literal('')),
});
