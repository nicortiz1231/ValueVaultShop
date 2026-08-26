import {reviews} from '~/lib/store-config';
import {StarIcon} from './Icons';

/**
 * Star rating display.
 *
 * Intentionally inert until real reviews exist: `reviews.enabled` is false in
 * store-config, so this renders nothing. Wire a review app (Judge.me, Loox,
 * Okendo) to supply `rating`/`count`, flip the flag, and every product card and
 * product page picks ratings up automatically.
 *
 * It renders null rather than showing placeholder stars on purpose. Fabricated
 * ratings are the fastest way to turn a real store into one that reads as fake.
 */
export function StarRating({
  rating,
  count,
  className = '',
}: {
  rating?: number | null;
  count?: number | null;
  className?: string;
}) {
  if (!reviews.enabled || typeof rating !== 'number' || !count) return null;

  const rounded = Math.round(rating * 2) / 2;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            filled={star <= rounded}
            className={`h-4 w-4 ${
              star <= rounded ? 'text-clay' : 'text-line-strong'
            }`}
          />
        ))}
      </div>
      <span className="text-[13px] text-ink-muted">
        {rating.toFixed(1)} ({count})
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5 from {count} reviews
      </span>
    </div>
  );
}
