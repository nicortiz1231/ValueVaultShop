import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {AnimatePresence, motion} from 'framer-motion';
import {Image, Money} from '@shopify/hydrogen';
import type {PredictiveSearchReturn} from '~/lib/search';
import {SEARCH_ENDPOINT} from '~/components/SearchFormPredictive';
import {EASE_OUT_QUART} from '~/lib/motion';
import {CloseIcon, SearchIcon} from '~/components/Icons';

/**
 * The header's search: an icon button that grows into a field in place.
 *
 * The drawer (Aside type="search") is still what the phone header opens --
 * there is no room to grow a field between the wordmark and the icons at
 * 375px. This is the desktop half of the same feature, so the two must stay
 * in step: both submit to [SEARCH_ENDPOINT] and both preview results from the
 * predictive endpoint.
 *
 * It does NOT reuse SearchFormPredictive/SearchResultsPredictive. Those two
 * are wired to the drawer specifically -- SearchResultsPredictive resolves
 * its input by `document.querySelector('input[type="search"]')` and its
 * close handler calls `aside.close()`, so a second mounted copy would fight
 * the drawer's over which input each one owns. This keeps a fetcher key of
 * its own instead, and the drawer is left exactly as it was.
 */

/** Keystrokes are cheap; predictive queries are not. */
const DEBOUNCE_MS = 180;

/** How many product suggestions the dropdown shows. */
const PREVIEW_LIMIT = 5;

/** Collapsed size -- the icon button, and the height of the field it becomes. */
const COLLAPSED = 36;

/**
 * How wide the field may grow, and the least it will settle for.
 *
 * The nav stays put and visible when the field opens, so the field takes
 * only the room actually free between the last nav item and the icons --
 * [useAvailableWidth] measures it. The floor is what a search field still
 * reads as; the ceiling is where a wider one stops looking like a header
 * control.
 */
const MAX_WIDTH = 320;
const MIN_WIDTH = 168;

/** Breathing room kept between the nav's last item and the field. */
const NAV_GAP = 20;

/** Matches the width transition below; also gates the close button. */
const EXPAND_MS = 300;

/**
 * The widest the field can open without touching [boundaryRef].
 *
 * Measured rather than expressed as a breakpoint because the nav is
 * config-driven -- adding an item to `navigation` widens it, and a hardcoded
 * `w-[20rem]` would quietly start overlapping the moment someone did.
 */
function useAvailableWidth(
  rootRef: React.RefObject<HTMLDivElement | null>,
  boundaryRef?: React.RefObject<HTMLElement | null>,
) {
  const [width, setWidth] = useState(MAX_WIDTH);

  useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      if (!root) return;
      // The field is right-anchored, so its right edge is the same whether
      // it is open or closed and this measures the same either way.
      const right = root.getBoundingClientRect().right;
      const boundary = boundaryRef?.current?.getBoundingClientRect().right ?? 0;
      const available = right - boundary - NAV_GAP;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, available)));
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rootRef, boundaryRef]);

  return width;
}

export function ExpandingSearch({
  open,
  onOpenChange,
  boundaryRef,
  className = '',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The element the field must not grow across -- the centred nav. */
  boundaryRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'header-search'});
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const width = useAvailableWidth(rootRef, boundaryRef);
  // The close button shares the edge the pointer just clicked to open the
  // field, so it stays inert until the field has finished opening -- without
  // it, a double-click on the magnifier opens and instantly closes again.
  const [settled, setSettled] = useState(false);

  const query = term.trim();
  const products = fetcher.data?.result?.items?.products ?? [];
  const total = fetcher.data?.result?.total ?? 0;
  // The dropdown is a preview of a query in progress, so it stays out of the
  // way until there is one -- an empty field gets the field alone.
  const showResults = open && query.length > 0;

  const close = useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current);
    setTerm('');
    onOpenChange(false);
  }, [onOpenChange]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTerm(value);
    if (debounce.current) clearTimeout(debounce.current);
    if (!value.trim()) return;
    debounce.current = setTimeout(() => {
      void fetcher.submit(
        {q: value, limit: PREVIEW_LIMIT, predictive: true},
        {method: 'GET', action: SEARCH_ENDPOINT},
      );
    }, DEBOUNCE_MS);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    void navigate(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`);
    close();
  }

  // Focus follows the expansion, so the click that opens the field is the
  // last one needed before typing.
  useEffect(() => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
    if (!open) {
      setSettled(false);
      return;
    }
    inputRef.current?.focus();
    expandTimer.current = setTimeout(() => setSettled(true), EXPAND_MS);
  }, [open]);

  useEffect(
    () => () => {
      if (debounce.current) clearTimeout(debounce.current);
      if (expandTimer.current) clearTimeout(expandTimer.current);
    },
    [],
  );

  // Escape and a click anywhere else both put it away -- an expanded field
  // sitting open over the nav after the visitor has moved on is noise.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form
        onSubmit={onSubmit}
        role="search"
        // Width is set inline because the target is measured, not a
        // breakpoint (see [useAvailableWidth]). It transitions in CSS rather
        // than in Framer so the global prefers-reduced-motion rule in
        // tailwind.css flattens it along with everything else.
        style={{width: open ? width : COLLAPSED}}
        className={[
          'flex h-9 items-center overflow-hidden rounded-pill border transition-[width,background-color,border-color] duration-300 ease-out-quart',
          open
            ? 'border-line-strong bg-surface'
            : 'border-transparent bg-transparent',
        ].join(' ')}
      >
        {/* The magnifier leads the row, so growing the field is what carries
            it from the collapsed button's position over to the left edge --
            one continuous slide out of the width transition itself, with no
            second animation to keep in step with it. */}
        <button
          // Collapsed it is the affordance that opens the field; expanded it
          // is the submit button, so the icon keeps one meaning throughout.
          type={open ? 'submit' : 'button'}
          onClick={open ? undefined : () => onOpenChange(true)}
          aria-label={open ? 'Submit search' : 'Search'}
          aria-expanded={open}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-ink/5"
        >
          <SearchIcon className="h-5 w-5 shrink-0" />
        </button>

        <input
          ref={inputRef}
          type="search"
          name="q"
          value={term}
          onChange={onChange}
          // Dropped along with the field: on the way closed the text is
          // already cleared, and a placeholder fading out inside a shrinking
          // pill is the one bit of this that reads as a glitch.
          placeholder={open ? 'Search products…' : ''}
          aria-label="Search products"
          autoComplete="off"
          // Kept mounted so the width transition has something to reveal,
          // but out of the tab order while it is a 36px circle.
          tabIndex={open ? 0 : -1}
          className={[
            // m-0/border-0/p-0 undo styles/reset.css, which gives every
            // bare `input` a pill border, padding and margins of its own --
            // unreset, that draws a second bordered field inside this one.
            'm-0 min-w-0 flex-1 border-0 bg-transparent p-0 pl-1 text-[14px] leading-none text-ink outline-none transition-opacity duration-200 placeholder:text-ink-soft',
            // The native clear affordance would sit on top of our own.
            '[&::-webkit-search-cancel-button]:hidden',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          ].join(' ')}
        />

        <AnimatePresence>
          {open && (
            <motion.button
              type="button"
              onClick={close}
              aria-label="Close search"
              // Inert until the field has finished opening: this corner is
              // exactly where the pointer that opened it is still resting.
              tabIndex={settled ? 0 : -1}
              initial={{scale: 0, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0, opacity: 0}}
              transition={{duration: 0.2, ease: EASE_OUT_QUART}}
              className={[
                'mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink',
                settled ? '' : 'pointer-events-none',
              ].join(' ')}
            >
              <CloseIcon className="h-4 w-4 shrink-0" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{opacity: 0, y: -8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -8}}
            transition={{duration: 0.2, ease: EASE_OUT_QUART}}
            className="absolute right-0 top-[calc(100%+0.75rem)] w-[22rem] overflow-hidden rounded-card border border-line bg-surface p-2 shadow-card"
          >
            <SearchPreview
              products={products.slice(0, PREVIEW_LIMIT)}
              total={total}
              query={query}
              loading={fetcher.state !== 'idle'}
              onNavigate={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchPreview({
  products,
  total,
  query,
  loading,
  onNavigate,
}: {
  products: NonNullable<
    PredictiveSearchReturn['result']['items']['products']
  >;
  total: number;
  query: string;
  loading: boolean;
  onNavigate: () => void;
}) {
  // Results already on screen are not blanked while the next keystroke's
  // query is in flight -- only the first one has nothing to keep showing.
  if (!products.length) {
    return (
      <p className="px-3 py-6 text-center text-sm text-ink-muted">
        {loading ? 'Searching…' : `No results for “${query}”`}
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col">
        {products.map((product) => {
          const variant = product.selectedOrFirstAvailableVariant;
          const image = variant?.image;
          return (
            <li key={product.id}>
              <Link
                to={`/products/${product.handle}`}
                prefetch="intent"
                onClick={onNavigate}
                className="flex items-center gap-3 rounded-2xl p-2 no-underline transition-colors hover:bg-bg-deep hover:no-underline"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-bg-deep">
                  {image && (
                    <Image
                      alt={image.altText ?? product.title}
                      src={image.url}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] leading-tight text-ink">
                    {product.title}
                  </p>
                  {variant?.price && (
                    <span className="text-[13px] text-ink-muted">
                      <Money data={variant.price} />
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        to={`${SEARCH_ENDPOINT}?q=${encodeURIComponent(query)}`}
        onClick={onNavigate}
        className="mt-1 block rounded-pill bg-bg-deep py-2.5 text-center text-[13px] font-semibold text-ink no-underline transition-colors hover:bg-line hover:no-underline"
      >
        View all {total} result{total === 1 ? '' : 's'}
      </Link>
    </>
  );
}
