import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONDITIONS } from '@/schemas/listingSchemas';

export const ALL_VALUE = 'all'; // Radix Select can't use an empty string as an item value

export default function ProductFilters({
  categories,
  category,
  onCategoryChange,
  condition,
  onConditionChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  location,
  onLocationChange,
  includeSold,
  onIncludeSoldChange,
  onClear,
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
          Clear all
        </Button>
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
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
      </div>

      <div className="space-y-1.5">
        <Label>Condition</Label>
        <Select value={condition} onValueChange={onConditionChange}>
          <SelectTrigger>
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
      </div>

      <div className="space-y-1.5">
        <Label>Price range (₹)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location-filter">Location</Label>
        <Input
          id="location-filter"
          placeholder="Hostel block, area..."
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Availability</Label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={includeSold}
            onChange={(e) => onIncludeSoldChange(e.target.checked)}
          />
          Include already-sold items
        </label>
      </div>
    </div>
  );
}
