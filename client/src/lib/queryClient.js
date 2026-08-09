import { QueryClient } from '@tanstack/react-query';

/**
 * Single shared QueryClient for the whole app.
 *
 * Defaults chosen deliberately:
 * - staleTime: 30s   -> listings/bids don't refetch on every focus/mount;
 *                       Socket.IO events (Step 9) will invalidate specific
 *                       queries in real time instead of polling.
 * - retry: 1          -> one retry for flaky networks, but we don't want
 *                       failed auth-protected calls hammering the API.
 * - refetchOnWindowFocus: false -> a marketplace app shouldn't re-fetch
 *                       every list every time a student tabs back in;
 *                       real-time updates come from sockets instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

/** Central place for query key factories — added to as each feature lands. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  users: {
    detail: (id) => ['users', 'detail', id],
  },
  products: {
    list: (params) => ['products', 'list', params],
    detail: (id) => ['products', 'detail', id],
    mine: ['products', 'mine'],
  },
  categories: {
    list: ['categories', 'list'],
  },
  buyerRequests: {
    list: (params) => ['buyerRequests', 'list', params],
    detail: (id) => ['buyerRequests', 'detail', id],
    mine: ['buyerRequests', 'mine'],
    bids: (id) => ['buyerRequests', 'bids', id],
  },
  bids: {
    mine: ['bids', 'mine'],
  },
};
