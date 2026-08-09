import { z } from 'zod';

export const CONDITION_PREFERENCES = [
  { value: 'any', label: 'Any condition' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like new' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export const buyerRequestSchema = z.object({
  itemName: z.string().trim().min(1, 'Item name is required').max(120, 'Must be under 120 characters'),
  description: z.string().trim().max(1000).optional().or(z.literal('')),
  category: z.string().trim().optional().or(z.literal('')),
  budget: z.coerce.number({ invalid_type_error: 'Enter a budget' }).min(0, 'Budget cannot be negative'),
  conditionPreference: z.enum(['any', 'new', 'like-new', 'good', 'fair', 'poor']).optional(),
  neededBy: z.string().optional().or(z.literal('')), // native date input value, ISO date string
  location: z.string().trim().max(100).optional().or(z.literal('')),
});
