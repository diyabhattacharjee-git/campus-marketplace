import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names (clsx) and then resolves any
 * conflicting Tailwind utilities (twMerge) so the last one wins.
 *
 * Example: cn('px-2 text-sm', isActive && 'text-primary', 'px-4')
 *       -> 'text-sm text-primary px-4'   (px-4 correctly overrides px-2)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
