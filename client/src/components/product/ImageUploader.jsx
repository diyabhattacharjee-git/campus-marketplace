import { useEffect, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_FILES = 6;

/**
 * Controlled: `files` is the array of File objects the parent form holds,
 * `onChange` receives the updated array. Preview URLs are generated with
 * createObjectURL and revoked on unmount/change to avoid leaking memory.
 */
export default function ImageUploader({ files, onChange, error }) {
  const inputRef = useRef(null);
  const previewsRef = useRef([]);

  const previews = files.map((file) => URL.createObjectURL(file));

  useEffect(() => {
    previewsRef.current = previews;
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const combined = [...files, ...selected].slice(0, MAX_FILES);
    onChange(combined);
    e.target.value = ''; // allow re-selecting the same file after removing it
  };

  const removeAt = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {previews.map((src, index) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-border">
            <img src={src} alt={`Upload preview ${index + 1}`} className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground"
            >
              <X className="size-3" />
            </button>
            {index === 0 && (
              <span className="absolute bottom-1 left-1 rounded bg-foreground/70 px-1.5 py-0.5 text-[10px] font-medium text-background">
                Cover
              </span>
            )}
          </div>
        ))}

        {files.length < MAX_FILES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary',
              error && 'border-destructive text-destructive',
            )}
          >
            <ImagePlus className="size-5" />
            <span className="text-xs">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleSelect}
      />

      <p className="mt-2 text-xs text-muted-foreground">
        First photo is the cover image. Up to {MAX_FILES} photos, 5MB each.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
