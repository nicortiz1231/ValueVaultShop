import {useEffect, useId, useMemo, useState} from 'react';
import {useNavigate, useSearchParams, useNavigation} from 'react-router';
import {
  inputToParam,
  PRICE_MAX_PARAM,
  PRICE_MIN_PARAM,
  SORT_OPTIONS,
} from '~/lib/collection-filters';
import {ChevronIcon, CloseIcon, FilterIcon, MinusIcon, PlusIcon} from './Icons';

/**
 * The collection page's filter and sort controls.
 *
 * Ported from the reference site (kaleidojewellery.com/collections/rings),
 * which puts a sticky bar above the grid -- "All Filters" on the left, the
 * product count and a sort dropdown on the right -- and hides every facet
 * behind a slide-over drawer rather than a permanent sidebar. That is the
 * right shape for a phone-first store: the sidebar costs a quarter of the grid
 * on desktop and collapses to a modal on mobile anyway.
 *
 * All state lives in the URL (see `~/lib/collection-filters`), so these are
 * thin controls over `useSearchParams` with no local mirror of the applied
 * filters to fall out of sync.
 */

export type FilterGroup = {
  id: string;
  label: string;
  type: string;
  values: {
    id: string;
    label: string;
    count: number;
    input: string;
  }[];
};

/** Replaces the query string, always resetting pagination back to page one. */
function useApplyParams() {
  const navigate = useNavigate();

  return (next: URLSearchParams) => {
    // A cursor from the previous result set is meaningless against a different
    // filter, and Shopify returns an error rather than ignoring it.
    next.delete('cursor');
    next.delete('direction');
    const query = next.toString();
    void navigate(query ? `?${query}` : '?', {
      replace: true,
      preventScrollReset: true,
    });
  };
}

export function CollectionControls({
  filters,
  productCount,
}: {
  filters: FilterGroup[];
  productCount: number | null;
}) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const appliedCount = countApplied(searchParams);

  return (
    <>
      {/* The reference's `.cns__topbar-wrapper`: sticky under the header,
          14px of padding from 1024 up, and a bottom hairline that it drops on
          desktop (`d-b-0`). */}
      <div className="sticky top-[calc(var(--spacing-header)+var(--spacing-announce))] z-20 border-b border-line bg-bg py-4 min-[1024px]:border-b-0 min-[1024px]:py-3.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              /* From 600px up the reference styles these as 4px-radius
                 rectangles at `padding: 6px 20px`, and fills the one that
                 carries an icon -- this one -- with solid black. */
              className="flex items-center gap-1.5 text-ink transition-colors min-[600px]:gap-1.5 min-[600px]:rounded-[4px] min-[600px]:border min-[600px]:border-ink min-[600px]:bg-ink min-[600px]:px-5 min-[600px]:py-1.5 min-[600px]:text-bg min-[600px]:hover:bg-brand min-[600px]:hover:border-brand"
            >
              <FilterIcon className="h-3.5 w-3.5" />
              <span className="type-p2 font-medium">
                <span className="hidden min-[600px]:inline">All Filters</span>
                <span className="min-[600px]:hidden">Filter &amp; Sort</span>
              </span>
              {appliedCount > 0 && (
                <span className="type-p4 rounded-full bg-brand px-1.5 font-semibold text-bg min-[600px]:bg-bg min-[600px]:text-ink">
                  {appliedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="type-p2 hidden rounded-[4px] border border-line-strong px-5 py-1.5 font-medium text-ink transition-colors hover:border-ink min-[1024px]:block"
            >
              Category
            </button>
          </div>

          <div className="flex items-center gap-6">
            {productCount !== null && (
              <span className="type-p2 text-ink">
                {productCount} {productCount === 1 ? 'Product' : 'Products'}
              </span>
            )}
            <SortSelect className="hidden min-[600px]:flex" />
          </div>
        </div>

        <AppliedFilterChips filters={filters} />
      </div>

      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        filters={filters}
        productCount={productCount}
      />
    </>
  );
}

/** How many facets are switched on, for the badge on the Filters button. */
function countApplied(searchParams: URLSearchParams) {
  let count = 0;
  let countedPrice = false;

  for (const key of searchParams.keys()) {
    if (key === PRICE_MIN_PARAM || key === PRICE_MAX_PARAM) {
      // A min and a max are two params but one filter, as far as the shopper
      // is concerned.
      if (!countedPrice) {
        countedPrice = true;
        count += 1;
      }
      continue;
    }
    if (key.startsWith('filter.')) count += 1;
  }

  return count;
}

function SortSelect({className = ''}: {className?: string}) {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();
  const id = useId();
  const current = searchParams.get('sort_by') ?? '';

  return (
    <div className={`items-center gap-1.5 ${className}`}>
      <label htmlFor={id} className="type-p2 text-ink-muted">
        Sort by:
      </label>
      <div className="relative">
        <select
          id={id}
          value={current}
          onChange={(event) => {
            const next = new URLSearchParams(searchParams);
            if (event.target.value) {
              next.set('sort_by', event.target.value);
            } else {
              next.delete('sort_by');
            }
            applyParams(next);
          }}
          className="type-p2 appearance-none bg-transparent pr-5 font-medium text-ink focus:outline-none"
        >
          <option value="">Featured</option>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronIcon className="pointer-events-none absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
      </div>
    </div>
  );
}

/**
 * The removable pills the reference shows under the bar once filters are on.
 *
 * Labels come from Shopify's own filter values rather than from the raw query
 * string, so a chip reads "Rose Gold" instead of `filter.v.option.colour`.
 */
function AppliedFilterChips({filters}: {filters: FilterGroup[]}) {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();

  const labels = useMemo(() => {
    const map = new Map<string, string>();
    for (const group of filters) {
      for (const value of group.values) {
        const param = inputToParam(value.input);
        if (param) map.set(`${param.key}=${param.value}`, value.label);
      }
    }
    return map;
  }, [filters]);

  const chips: {key: string; value: string; label: string}[] = [];
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith('filter.')) continue;
    if (key === PRICE_MIN_PARAM || key === PRICE_MAX_PARAM) continue;
    chips.push({key, value, label: labels.get(`${key}=${value}`) ?? value});
  }

  const priceMin = searchParams.get(PRICE_MIN_PARAM);
  const priceMax = searchParams.get(PRICE_MAX_PARAM);

  if (chips.length === 0 && !priceMin && !priceMax) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      {chips.map((chip) => (
        <button
          key={`${chip.key}=${chip.value}`}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            const remaining = next
              .getAll(chip.key)
              .filter((entry) => entry !== chip.value);
            next.delete(chip.key);
            for (const entry of remaining) next.append(chip.key, entry);
            applyParams(next);
          }}
          className="type-p4 inline-flex items-center gap-1 rounded-[4px] bg-bg-deep px-2 py-1 text-ink transition-colors hover:bg-brand-tint"
        >
          {chip.label}
          <CloseIcon className="h-3 w-3" />
        </button>
      ))}

      {(priceMin || priceMax) && (
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete(PRICE_MIN_PARAM);
            next.delete(PRICE_MAX_PARAM);
            applyParams(next);
          }}
          className="type-p4 inline-flex items-center gap-1 rounded-[4px] bg-bg-deep px-2 py-1 text-ink transition-colors hover:bg-brand-tint"
        >
          ${priceMin || '0'} – ${priceMax || '∞'}
          <CloseIcon className="h-3 w-3" />
        </button>
      )}

      <ClearButton className="type-p4 uppercase tracking-[0.5px] text-ink-muted underline underline-offset-2 hover:text-ink" />
    </div>
  );
}

function ClearButton({className = ''}: {className?: string}) {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();

  const hasFilters = [...searchParams.keys()].some((key) =>
    key.startsWith('filter.'),
  );
  if (!hasFilters) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        const next = new URLSearchParams(searchParams);
        for (const key of [...next.keys()]) {
          if (key.startsWith('filter.')) next.delete(key);
        }
        applyParams(next);
      }}
    >
      Clear
    </button>
  );
}

function FilterDrawer({
  open,
  onClose,
  filters,
  productCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterGroup[];
  productCount: number | null;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    document.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      },
      {signal: controller.signal},
    );

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      controller.abort();
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      aria-hidden={!open}
      className={[
        'fixed inset-0 z-50 transition-opacity duration-300',
        open
          ? 'visible opacity-100'
          : 'pointer-events-none invisible opacity-0',
      ].join(' ')}
    >
      <button
        type="button"
        aria-label="Close filters"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[#1f1f1f99]"
      />

      {/* The reference's `.cns__drawer-inner`. Two quite different shapes:
          a bottom sheet at 90% on a phone, and from 600px up a floating
          panel inset 32px from the left and top, 360px wide (400 from 1440,
          420 from 1920). Both slide in over 300ms.

          The sheet is a percentage of this fixed `inset-0` parent rather than
          90vh, because on a phone those are not the same box: `vh` is the
          LARGE viewport, the page as it is with the browser toolbars rolled
          away, so a 90vh sheet measured against it hangs below the screen
          while the toolbars are showing and its footer actions go with it. */}
      <div
        className={[
          'absolute flex flex-col bg-bg',
          'bottom-0 left-0 h-[90%] w-full rounded-t-[6px]',
          'min-[600px]:bottom-auto min-[600px]:left-8 min-[600px]:top-8',
          'min-[600px]:h-[calc(100vh-64px)] min-[600px]:w-[360px] min-[600px]:rounded-[8px]',
          'min-[1440px]:w-[400px] min-[1920px]:w-[420px]',
          'shadow-lift transition-transform duration-300 ease-out',
          open
            ? 'translate-y-0 min-[600px]:translate-x-0'
            : 'translate-y-full min-[600px]:translate-y-0 min-[600px]:-translate-x-[calc(100%+2rem)]',
        ].join(' ')}
      >
        <header className="border-b border-line px-4 py-4 min-[1024px]:px-4 min-[1440px]:px-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className="type-h6 text-ink">
              Filter &amp; Sort
            </h2>
            <div className="flex items-center gap-2 min-[1024px]:gap-3">
              <ClearButton className="type-p4 uppercase tracking-[0.5px] text-ink-muted hover:text-ink" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close filters"
                tabIndex={open ? 0 : -1}
                // The icon stays 16px, but on a phone the thing you can
                // actually hit must not be: the ::before grows the touch
                // target to 36x40 without occupying any layout, so the header
                // row is laid out exactly as it was. It reaches only 8px to
                // the left -- the width of the gap -- so it stops at "Clear"
                // rather than over it, and takes the slack on the right where
                // there is nothing but the panel edge. Dropped from 600px up,
                // where this is a pointer target rather than a thumb one.
                className="relative flex h-4 w-4 items-center justify-center text-ink-muted transition-colors before:absolute before:-inset-y-3 before:-left-2 before:-right-3 before:content-[''] hover:text-ink min-[600px]:before:hidden"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 min-[1440px]:px-5">
          {/* Sort lives inside the drawer on phones, where the bar has no room
              for a dropdown -- the same split the reference makes. */}
          <Accordion title="Sort by" className="sm:hidden" defaultOpen>
            <SortRadios />
          </Accordion>

          {filters.map((group) => (
            <Accordion key={group.id} title={group.label} defaultOpen>
              {group.type === 'PRICE_RANGE' ? (
                <PriceRange group={group} />
              ) : (
                <FilterCheckboxes group={group} />
              )}
            </Accordion>
          ))}

          {filters.length === 0 && (
            <p className="type-p2 py-6 text-ink-muted">
              This collection has no filters yet. Filters come from Shopify’s
              Search &amp; Discovery app — turn them on there and they appear
              here automatically.
            </p>
          )}
        </div>

        <footer className="border-t border-line px-4 py-3 min-[1440px]:px-5">
          <button
            type="button"
            onClick={onClose}
            className="type-p2 h-11 w-full rounded-[4px] bg-ink font-medium text-bg transition-colors hover:bg-brand"
          >
            {productCount === null
              ? 'View products'
              : `View ${productCount} ${productCount === 1 ? 'Product' : 'Products'}`}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Accordion({
  title,
  children,
  defaultOpen = false,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`border-b border-line ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="type-p2 font-medium text-ink">{title}</span>
        {open ? (
          <MinusIcon className="h-4 w-4 text-ink-muted" />
        ) : (
          <PlusIcon className="h-4 w-4 text-ink-muted" />
        )}
      </button>
      {open && <div className="pb-5">{children}</div>}
    </div>
  );
}

function SortRadios() {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();
  const current = searchParams.get('sort_by') ?? '';

  const options = [{value: '', label: 'Featured'}, ...SORT_OPTIONS];

  return (
    <ul className="flex flex-col gap-2.5">
      {options.map((option) => (
        <li key={option.value || 'featured'}>
          <label className="type-p2 flex cursor-pointer items-center gap-2.5 text-ink">
            <input
              type="radio"
              name="sort_by"
              value={option.value}
              checked={current === option.value}
              onChange={() => {
                const next = new URLSearchParams(searchParams);
                if (option.value) {
                  next.set('sort_by', option.value);
                } else {
                  next.delete('sort_by');
                }
                applyParams(next);
              }}
              className="m-0 h-4 w-4 shrink-0 border-0 p-0 accent-[var(--color-brand)]"
            />
            {option.label}
          </label>
        </li>
      ))}
    </ul>
  );
}

function FilterCheckboxes({group}: {group: FilterGroup}) {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();

  return (
    <ul className="flex flex-col gap-2.5">
      {group.values.map((value) => {
        const param = inputToParam(value.input);
        if (!param) return null;

        const checked = searchParams.getAll(param.key).includes(param.value);

        return (
          <li key={value.id}>
            <label
              className={[
                'type-p2 flex cursor-pointer items-center gap-2.5',
                // Shopify reports a zero count for a facet that no product in
                // the current result set has. Dimming rather than hiding it
                // keeps the list from reshuffling under the shopper's finger.
                value.count === 0 ? 'text-ink-soft' : 'text-ink',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={value.count === 0 && !checked}
                onChange={() => {
                  const next = new URLSearchParams(searchParams);
                  if (checked) {
                    const remaining = next
                      .getAll(param.key)
                      .filter((entry) => entry !== param.value);
                    next.delete(param.key);
                    for (const entry of remaining) next.append(param.key, entry);
                  } else {
                    next.append(param.key, param.value);
                  }
                  applyParams(next);
                }}
                className="m-0 h-4 w-4 shrink-0 rounded-[3px] border-0 p-0 accent-[var(--color-brand)]"
              />
              <span className="flex-1">{value.label}</span>
              <span className="type-p4 text-ink-soft">({value.count})</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Price is the one facet Shopify hands back as a range rather than a list, so
 * it gets the reference's paired min/max inputs instead of checkboxes.
 */
function PriceRange({group}: {group: FilterGroup}) {
  const [searchParams] = useSearchParams();
  const applyParams = useApplyParams();
  const navigation = useNavigation();

  const bounds = useMemo(() => {
    try {
      const parsed = JSON.parse(group.values[0]?.input ?? '{}') as {
        price?: {min?: number; max?: number};
      };
      return {
        min: Number(parsed.price?.min ?? 0),
        max: Number(parsed.price?.max ?? 0),
      };
    } catch {
      return {min: 0, max: 0};
    }
  }, [group]);

  const [min, setMin] = useState(searchParams.get(PRICE_MIN_PARAM) ?? '');
  const [max, setMax] = useState(searchParams.get(PRICE_MAX_PARAM) ?? '');

  // The inputs are uncontrolled between submissions so typing is not fighting a
  // round trip, but they resync whenever the URL changes underneath them (Back
  // button, a cleared chip, a fresh navigation).
  useEffect(() => {
    setMin(searchParams.get(PRICE_MIN_PARAM) ?? '');
    setMax(searchParams.get(PRICE_MAX_PARAM) ?? '');
  }, [searchParams]);

  const apply = () => {
    const next = new URLSearchParams(searchParams);
    if (min.trim()) next.set(PRICE_MIN_PARAM, min.trim());
    else next.delete(PRICE_MIN_PARAM);
    if (max.trim()) next.set(PRICE_MAX_PARAM, max.trim());
    else next.delete(PRICE_MAX_PARAM);
    applyParams(next);
  };

  // `.cns__price-input > div { width: 140px }` on the reference.
  const field =
    'type-p2 flex w-[140px] max-w-full items-center gap-1 rounded-[4px] border border-line-strong bg-surface px-3 py-2 text-ink';

  return (
    <div className="flex items-center gap-3">
      <div className={field}>
        <span className="text-ink-muted">$</span>
        <input
          type="number"
          min={0}
          max={bounds.max || undefined}
          inputMode="decimal"
          aria-label="Minimum price"
          placeholder={String(Math.floor(bounds.min))}
          value={min}
          onChange={(event) => setMin(event.target.value)}
          onBlur={apply}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
          className="m-0 w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-right focus:outline-none"
        />
      </div>
      <span className="type-p2 text-ink-muted">to</span>
      <div className={field}>
        <span className="text-ink-muted">$</span>
        <input
          type="number"
          min={0}
          max={bounds.max || undefined}
          inputMode="decimal"
          aria-label="Maximum price"
          placeholder={String(Math.ceil(bounds.max))}
          value={max}
          onChange={(event) => setMax(event.target.value)}
          onBlur={apply}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              apply();
            }
          }}
          className="m-0 w-full min-w-0 rounded-none border-0 bg-transparent p-0 text-right focus:outline-none"
        />
      </div>
      {navigation.state !== 'idle' && (
        <span className="sr-only" role="status">
          Updating results
        </span>
      )}
    </div>
  );
}
