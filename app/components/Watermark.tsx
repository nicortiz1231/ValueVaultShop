import {store} from '~/lib/store-config';

/**
 * The oversized, near-invisible wordmark used as a section break.
 *
 * Kaleido repeats its own logotype as huge pale background typography
 * between content sections -- a cheap, distinctive way to remind a scrolling
 * visitor whose site they're on without adding another headline. This is
 * that motif, reused with the store name instead of a generic divider.
 */
export function Watermark({className = ''}: {className?: string}) {
  return (
    <div
      aria-hidden="true"
      className={`overflow-hidden whitespace-nowrap py-8 text-center ${className}`}
    >
      <span className="wordmark-bg text-[18vw] leading-none sm:text-[13vw]">
        {store.name}
      </span>
    </div>
  );
}
