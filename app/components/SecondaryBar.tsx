import {store} from '~/lib/store-config';

/**
 * The second, playful strip beneath the main nav -- the reference site
 * pairs its factual top bar with a lighter, more personality-driven line
 * just below the logo row. This carries the store's own tagline rather than
 * inventing a seasonal hook, since it's copy already approved for the About
 * page and won't drift from what the brand actually says elsewhere.
 */
export function SecondaryBar() {
  return (
    <div className="flex h-9 items-center justify-center bg-block-butter px-4 text-center">
      <span className="text-[12px] font-medium tracking-tight text-ink-muted">
        {store.tagline}
      </span>
    </div>
  );
}
