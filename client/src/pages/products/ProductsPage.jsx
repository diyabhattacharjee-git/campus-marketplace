import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import ProductCard from '@/components/product/ProductCard';
import ProductFilters, { ALL_VALUE } from '@/components/product/ProductFilters';

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

const INITIAL_FILTERS = {
  search: '',
  category: ALL_VALUE,
  condition: ALL_VALUE,
  minPrice: '',
  maxPrice: '',
  location: '',
  includeSold: false,
};

export default function ProductsPage() {
  const [search, setSearch] = useState(INITIAL_FILTERS.search);
  const [category, setCategory] = useState(INITIAL_FILTERS.category);
  const [condition, setCondition] = useState(INITIAL_FILTERS.condition);
  const [minPrice, setMinPrice] = useState(INITIAL_FILTERS.minPrice);
  const [maxPrice, setMaxPrice] = useState(INITIAL_FILTERS.maxPrice);
  const [location, setLocation] = useState(INITIAL_FILTERS.location);
  const [includeSold, setIncludeSold] = useState(INITIAL_FILTERS.includeSold);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);
  const debouncedMinPrice = useDebouncedValue(minPrice);
  const debouncedMaxPrice = useDebouncedValue(maxPrice);
  const debouncedLocation = useDebouncedValue(location);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: category === ALL_VALUE ? undefined : category,
      condition: condition === ALL_VALUE ? undefined : condition,
      minPrice: debouncedMinPrice !== '' ? Number(debouncedMinPrice) : undefined,
      maxPrice: debouncedMaxPrice !== '' ? Number(debouncedMaxPrice) : undefined,
      location: debouncedLocation || undefined,
      includeSold: includeSold || undefined,
      sort,
      page,
      limit: 12,
    }),
    [debouncedSearch, category, condition, debouncedMinPrice, debouncedMaxPrice, debouncedLocation, includeSold, sort, page],
  );

  const activeFilterCount = [
    category !== ALL_VALUE,
    condition !== ALL_VALUE,
    minPrice !== '',
    maxPrice !== '',
    location !== '',
    includeSold,
  ].filter(Boolean).length;

  const { data: categoriesRes } = useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => categoryService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesRes?.data.categories || [];

  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => listingService.getListings(filters),
    placeholderData: (previous) => previous,
  });

  const listings = data?.data.listings || [];
  const pagination = data?.data.pagination;

  const resetFilters = () => {
    setCategory(INITIAL_FILTERS.category);
    setCondition(INITIAL_FILTERS.condition);
    setMinPrice(INITIAL_FILTERS.minPrice);
    setMaxPrice(INITIAL_FILTERS.maxPrice);
    setLocation(INITIAL_FILTERS.location);
    setIncludeSold(INITIAL_FILTERS.includeSold);
    setPage(1);
  };

  const resetAll = () => {
    setSearch(INITIAL_FILTERS.search);
    resetFilters();
  };

  // Any filter change also resets to page 1 — browsing page 3 of "all
  // categories" and then narrowing to one category shouldn't leave you
  // stranded on a page number that may no longer exist.
  const withPageReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const filterProps = {
    categories,
    category,
    onCategoryChange: withPageReset(setCategory),
    condition,
    onConditionChange: withPageReset(setCondition),
    minPrice,
    onMinPriceChange: withPageReset(setMinPrice),
    maxPrice,
    onMaxPriceChange: withPageReset(setMaxPrice),
    location,
    onLocationChange: withPageReset(setLocation),
    includeSold,
    onIncludeSoldChange: withPageReset(setIncludeSold),
    onClear: () => {
      resetFilters();
      setFiltersOpen(false);
    },
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

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Persistent filter sidebar — desktop only */}
        <aside className="hidden shrink-0 lg:block lg:w-64">
          <Card>
            <CardContent className="pt-6">
              <ProductFilters {...filterProps} />
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          {/* Search + sort + mobile filters trigger */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="size-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <ProductFilters {...filterProps} />
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="sm:w-48">
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
          </div>

          {isLoading && <GridSkeleton />}

          {isError && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Couldn’t load listings right now — try again in a moment.
            </p>
          )}

          {!isLoading && !isError && listings.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
              <p>No listings match your filters.</p>
              <Button variant="outline" onClick={resetAll}>
                Clear filters
              </Button>
            </div>
          )}

          {listings.length > 0 && (
            <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
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
