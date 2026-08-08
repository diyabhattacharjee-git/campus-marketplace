import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/product/ProductCard';
import { CONDITIONS } from '@/schemas/listingSchemas';

import { listingService } from '@/services/listingService';
import { categoryService } from '@/services/categoryService';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { queryKeys } from '@/lib/queryClient';
import { ROUTES } from '@/constants/routes';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];

const ALL_VALUE = 'all'; // Radix Select can't use an empty string as an item value

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL_VALUE);
  const [condition, setCondition] = useState(ALL_VALUE);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category === ALL_VALUE ? undefined : category,
      condition: condition === ALL_VALUE ? undefined : condition,
      sort,
      page,
      limit: 12,
    }),
    [debouncedSearch, category, condition, sort, page],
  );

  const { data: categoriesRes } = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000, // categories barely change — cache longer than the default
  });
  const categories = categoriesRes?.data.categories || [];

  const {
    data,
    isLoading,
    isError,
    isPlaceholderData,
  } = useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => listingService.getListings(filters),
    placeholderData: (previous) => previous, // keep showing the current page while the next one loads, no flash-to-empty
  });

  const listings = data?.data.listings || [];
  const pagination = data?.data.pagination;

  const resetFilters = () => {
    setSearch('');
    setCategory(ALL_VALUE);
    setCondition(ALL_VALUE);
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Browse what’s for sale on your campus.</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.CREATE_PRODUCT}>
            <Plus className="size-4" />
            List an item
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="lg:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={condition}
            onValueChange={(v) => {
              setCondition(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Any condition</SelectItem>
              {CONDITIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="lg:w-48">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && <GridSkeleton />}

      {isError && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Couldn’t load listings right now — try again in a moment.
        </p>
      )}

      {!isLoading && !isError && listings.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <p>No listings match your filters.</p>
          <Button variant="outline" onClick={resetFilters}>
            Clear filters
          </Button>
        </div>
      )}

      {listings.length > 0 && (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ProductCard key={listing._id} listing={listing} />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="aspect-square rounded-lg bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
