import { z } from 'zod';

export const bidSchema = z.object({
  price: z.coerce.number({ invalid_type_error: 'Enter a price' }).min(0, 'Price cannot be negative'),
  condition: z.enum(['new', 'like-new', 'good', 'fair', 'poor'], {
    errorMap: () => ({ message: 'Choose a condition' }),
  }),
  deliveryEstimateDays: z.coerce
    .number({ invalid_type_error: 'Enter delivery time in days' })
    .int('Must be a whole number')
    .min(0, 'Cannot be negative'),
  message: z.string().trim().max(500).optional().or(z.literal('')),
});
